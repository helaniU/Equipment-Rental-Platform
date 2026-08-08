import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { User } from '../database/entities/user.entity';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
  ) {}

  async processPayment(user: User, dto: ProcessPaymentDto) {
    const reservation = await this.reservationRepo.findOne({
      where: { id: dto.reservationId },
      relations: ['user', 'items', 'items.equipment'],
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;
    if (roleName === 'CUSTOMER' && reservation.user?.id !== user.id) {
      throw new ForbiddenException('You can only make payments for your own reservations');
    }

    // Mock payment execution logic
    const isSuccess = !dto.simulateFailure;
    const status = isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED;
    const ref = `TXN-MOCK-${Date.now()}`;

    const payment = this.paymentRepo.create({
      reservation,
      user,
      amount: dto.amount,
      type: dto.type,
      status,
      transactionReference: ref,
      paymentMethod: dto.paymentMethod || 'MOCK_CARD',
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // Auto-approve or update reservation status if payment was successful
    if (isSuccess && reservation.status === ReservationStatus.PENDING) {
      reservation.status = ReservationStatus.APPROVED;
      await this.reservationRepo.save(reservation);
    }

    return savedPayment;
  }

  async refundPayment(paymentId: string, user: User, dto: RefundPaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['reservation'],
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only PAID transactions can be refunded');
    }

    payment.status = PaymentStatus.REFUNDED;
    return this.paymentRepo.save(payment);
  }

  async processRefund(reservationId: string) {
  // 1. Update reservation status
  await this.reservationRepo.update(reservationId, { status: 'REFUNDED' as ReservationStatus });

  // 2. Find and update the linked payment record
  const payment = await this.paymentRepo.findOne({ where: { reservation: { id: reservationId } } });
  if (payment) {
    payment.status = 'REFUNDED' as any; // or 'REFUNDED' matching your PaymentStatus enum
    await this.paymentRepo.save(payment);
  }
}

  async updateStatus(paymentId: string, status: PaymentStatus) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['reservation'],
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    payment.status = status;
    const savedPayment = await this.paymentRepo.save(payment);

    if (status === PaymentStatus.PAID && payment.reservation) {
      payment.reservation.status = ReservationStatus.APPROVED;
      await this.reservationRepo.save(payment.reservation);
    }

    return savedPayment;
  }

  async findAll(user: User) {
    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;

    const relations = ['reservation', 'reservation.user', 'reservation.items', 'user'];

    if (['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(roleName)) {
      return this.paymentRepo.find({
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    return this.paymentRepo.find({
      where: { user: { id: user.id } },
      relations,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['reservation', 'reservation.user', 'user'],
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;
    if (roleName === 'CUSTOMER' && payment.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }
}