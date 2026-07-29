import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { User } from '../database/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
  ) {}

  async findAll(user: User) {
    const roleName = typeof user.role === 'object' ? user.role?.name : user.role;

    const queryBuilder = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'reservation')
      .leftJoinAndSelect('reservation.customer', 'customer')
      .orderBy('payment.createdAt', 'DESC');

    if (!['ADMIN', 'STAFF'].includes(roleName)) {
      queryBuilder.where('customer.id = :customerId', { customerId: user.id });
    }

    return queryBuilder.getMany();
  }

  async processPayment(dto: CreatePaymentDto) {
    const reservation = await this.reservationRepo.findOne({
      where: { id: dto.reservationId },
      relations: ['items'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled reservation');
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = this.paymentRepo.create({
      reservation,
      amount: dto.amount,
      status: PaymentStatus.PAID,
      transactionId,
    });

    await this.paymentRepo.save(payment);

    // Confirm and approve reservation upon payment
    reservation.status = ReservationStatus.APPROVED;
    await this.reservationRepo.save(reservation);

    return payment;
  }

  async findByReservation(reservationId: string) {
    return this.paymentRepo.find({
      where: { reservation: { id: reservationId } },
      relations: ['reservation', 'reservation.customer'],
    });
  }

  async updateStatus(id: string, status: PaymentStatus) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['reservation'],
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    payment.status = status;

    if (status === PaymentStatus.PAID && payment.reservation) {
      payment.reservation.status = ReservationStatus.APPROVED;
      await this.reservationRepo.save(payment.reservation);
    }

    return this.paymentRepo.save(payment);
  }

  async refund(paymentId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment record not found');

    payment.status = PaymentStatus.REFUNDED;
    return this.paymentRepo.save(payment);
  }
}