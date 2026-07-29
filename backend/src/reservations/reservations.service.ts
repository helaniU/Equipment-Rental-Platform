import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { ReservationItem } from '../database/entities/reservation-item.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { User } from '../database/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

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
      customer: user,
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
  const roleName = typeof user.role === 'object' ? user.role?.name : user.role;

  if (['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(roleName)) {
    return this.reservationRepo.find({ 
      relations: ['customer', 'items', 'items.equipment'],
      order: { createdAt: 'DESC' }
    });
  }

  return this.reservationRepo.find({
    where: { customer: { id: user.id } },
    relations: ['items', 'items.equipment'],
    order: { createdAt: 'DESC' }
  });
}

  async findOne(id: string, user: User) {
    const res = await this.reservationRepo.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.equipment'],
    });

    if (!res) throw new NotFoundException('Reservation not found');
    if (user.role.name === 'CUSTOMER' && res.customer.id !== user.id) {
      throw new BadRequestException('Access denied');
    }

    return res;
  }

  async updateStatus(id: string, status: ReservationStatus) {
    const res = await this.reservationRepo.findOne({ where: { id } });
    if (!res) throw new NotFoundException('Reservation not found');
    res.status = status;
    return this.reservationRepo.save(res);
  }
}