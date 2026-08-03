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
      relations: ['user'],
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

  async findAll(user: User) {
    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;

    if (['ADMIN', 'STAFF'].includes(roleName)) {
      return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
    }

    return this.paymentRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    const roleName = typeof user.role === 'object' ? (user.role as any)?.name : user.role;
    if (roleName === 'CUSTOMER' && payment.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }
}