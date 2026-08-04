import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { ReservationItem } from '../database/entities/reservation-item.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { User } from '../database/entities/user.entity';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationItem) private itemRepo: Repository<ReservationItem>,
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleRentalReminders() {
    console.log('Running scheduled job: Checking for upcoming returns and overdue reservations...');

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const upcomingReservations = await this.reservationRepo.find({
      where: {
        status: ReservationStatus.ACTIVE,
        returnDate: Between(
          new Date(tomorrow.setHours(0, 0, 0, 0)),
          new Date(tomorrow.setHours(23, 59, 59, 999))
        ),
      },
      relations: ['user'],
    });

    for (const res of upcomingReservations) {
      if (res.user?.email) {
        await this.notificationQueue.add('UPCOMING_RETURN_REMINDER', {
          reservationId: res.id,
          email: res.user.email,
          returnDate: res.returnDate,
        });
        console.log(`Queued upcoming return reminder for: ${res.user.email}`);
      }
    }
  }

  async create(user: User, dto: CreateReservationDto) {
    const pickup = new Date(dto.pickupDate);
    const returnDt = new Date(dto.returnDate);

    if (pickup >= returnDt) {
      throw new BadRequestException('Return date must be after pickup date');
    }

    const days = Math.ceil((returnDt.getTime() - pickup.getTime()) / (1000 * 3600 * 24));
    let totalPrice = 0;
    let totalDeposit = 0;
    const reservationItems: ReservationItem[] = [];

    for (const itemDto of dto.items) {
      const equipment = await this.equipmentRepo.findOne({ where: { id: itemDto.equipmentId } });
      if (!equipment) {
        throw new NotFoundException(`Equipment ${itemDto.equipmentId} not found`);
      }

      if (equipment.stockQuantity < itemDto.quantity) {
        throw new BadRequestException(`Insufficient stock for ${equipment.name}`);
      }

      const itemPrice = Number(equipment.rentalPrice) * days * itemDto.quantity;
      const itemDeposit = Number(equipment.deposit) * itemDto.quantity;

      totalPrice += itemPrice;
      totalDeposit += itemDeposit;

      const item = this.itemRepo.create({
        equipment,
        quantity: itemDto.quantity,
        unitPrice: equipment.rentalPrice,
      });

      reservationItems.push(item);
    }

    const reservation = this.reservationRepo.create({
      user,
      pickupDate: pickup,
      returnDate: returnDt,
      totalPrice,
      depositAmount: totalDeposit,
      status: ReservationStatus.PENDING,
      items: reservationItems,
      qrCode: `QR-RES-${Date.now()}`,
    });

    return this.reservationRepo.save(reservation);
  }

  async findAll(user: User) {
    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;

    let reservations = [];
    if (['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(roleName)) {
      reservations = await this.reservationRepo.find({ 
        relations: ['user', 'items', 'items.equipment'],
        order: { createdAt: 'DESC' }
      });
    } else {
      reservations = await this.reservationRepo.find({
        where: { user: { id: user.id } },
        relations: ['items', 'items.equipment'],
        order: { createdAt: 'DESC' }
      });
    }

    const enrichedReservations = await Promise.all(
      reservations.map(async (res) => {
        const payment = await this.paymentRepo.findOne({ where: { reservation: { id: res.id } } });
        return {
          ...res,
          isPaid: payment ? payment.status === PaymentStatus.PAID : false,
          paymentStatus: payment ? payment.status : 'PENDING',
        };
      })
    );

    return enrichedReservations;
  }

  async findOne(id: string, user: User) {
    const res = await this.reservationRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.equipment'],
    });

    if (!res) throw new NotFoundException('Reservation not found');

    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;
    if (roleName === 'CUSTOMER' && res.user?.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    const payment = await this.paymentRepo.findOne({ where: { reservation: { id: res.id } } });
    return {
      ...res,
      isPaid: payment ? payment.status === PaymentStatus.PAID : false,
      paymentStatus: payment ? payment.status : 'PENDING',
    };
  }

  async updateStatus(id: string, dto: UpdateReservationStatusDto) {
    const res = await this.reservationRepo.findOne({
      where: { id },
      relations: ['items', 'items.equipment', 'user'],
    });

    if (!res) throw new NotFoundException('Reservation not found');

    if (dto.status === ReservationStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a reservation');
    }

    const oldStatus = res.status;
    const newStatus = dto.status;

    if (newStatus === ReservationStatus.ACTIVE && oldStatus !== ReservationStatus.ACTIVE) {
      for (const item of res.items) {
        const equipment = item.equipment;
        if (equipment.stockQuantity < item.quantity) {
          throw new BadRequestException(`Cannot activate: Insufficient stock for ${equipment.name}`);
        }
        equipment.stockQuantity -= item.quantity;
        if (equipment.stockQuantity <= 0) equipment.isAvailable = false;
        await this.equipmentRepo.save(equipment);
      }
    } else if (newStatus === ReservationStatus.RETURNED && oldStatus === ReservationStatus.ACTIVE) {
      for (const item of res.items) {
        const equipment = item.equipment;
        equipment.stockQuantity += item.quantity;
        if (equipment.stockQuantity > 0) equipment.isAvailable = true;
        await this.equipmentRepo.save(equipment);
      }
    }

    res.status = newStatus;
    if (dto.rejectionReason) {
      res.rejectionReason = dto.rejectionReason;
    }

    const updatedReservation = await this.reservationRepo.save(res);

    if ([ReservationStatus.APPROVED, ReservationStatus.REJECTED, ReservationStatus.REFUNDED].includes(newStatus)) {
      await this.notificationQueue.add('RENTAL_CONFIRMATION', {
        reservationId: updatedReservation.id,
        email: updatedReservation.user?.email,
        status: newStatus,
        reason: dto.rejectionReason || '',
        totalPrice: updatedReservation.totalPrice,
      });
    }

    return updatedReservation;
  }

  async cancel(id: string, user: User) {
    const res = await this.reservationRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!res) throw new NotFoundException('Reservation not found');

    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;
    if (roleName === 'CUSTOMER' && res.user?.id !== user.id) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    const payment = await this.paymentRepo.findOne({ where: { reservation: { id: res.id } } });
    const isPaid = payment && payment.status === PaymentStatus.PAID;

    if (isPaid) {
      res.status = ReservationStatus.REFUND_REQUESTED;
      await this.reservationRepo.save(res);
      return { message: 'Refund requested successfully for the paid reservation.' };
    }

    if (res.status !== ReservationStatus.PENDING && res.status !== ReservationStatus.APPROVED) {
      throw new BadRequestException('Reservation cannot be cancelled at this stage');
    }

    res.status = ReservationStatus.CANCELLED;
    return this.reservationRepo.save(res);
  }
}