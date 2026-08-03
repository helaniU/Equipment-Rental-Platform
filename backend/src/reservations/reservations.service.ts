import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { ReservationItem } from '../database/entities/reservation-item.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { User } from '../database/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationItem) private itemRepo: Repository<ReservationItem>,
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
  ) {}

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
      user, // Use 'user' instead of 'customer'
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

    if (['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(roleName)) {
      return this.reservationRepo.find({ 
        relations: ['user', 'items', 'items.equipment'],
        order: { createdAt: 'DESC' }
      });
    }

    return this.reservationRepo.find({
      where: { user: { id: user.id } }, // Use 'user' instead of 'customer'
      relations: ['items', 'items.equipment'],
      order: { createdAt: 'DESC' }
    });
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

    return res;
  }

  async updateStatus(id: string, dto: UpdateReservationStatusDto) {
    const res = await this.reservationRepo.findOne({
      where: { id },
      relations: ['items', 'items.equipment'],
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

    return this.reservationRepo.save(res);
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

    if (res.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only PENDING reservations can be cancelled');
    }

    res.status = ReservationStatus.CANCELLED;
    return this.reservationRepo.save(res);
  }
}