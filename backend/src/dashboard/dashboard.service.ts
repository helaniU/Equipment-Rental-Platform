import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { RoleType } from '../database/entities/role.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
  ) {}

  async getMetrics() {
    const totalCustomers = await this.userRepo.count({
    where: { role: { name: RoleType.CUSTOMER } },
    });

    const activeReservations = await this.reservationRepo.count({
      where: { status: ReservationStatus.ACTIVE },
    });

    const revenueResult = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    const equipmentStats = await this.equipmentRepo.find();
    const totalStock = equipmentStats.reduce((acc, curr) => acc + curr.stockQuantity, 0);

    return {
      totalCustomers,
      activeReservations,
      totalRevenue,
      totalStockCount: totalStock,
    };
  }
}