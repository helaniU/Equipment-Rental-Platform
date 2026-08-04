import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Reservation, ReservationStatus } from '../database/entities/reservation.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async getStats() {
    try {
      const excludedReservationStatuses = ['CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'];

      // 1. Total Customers Count
      const totalCustomers = await this.userRepo.count();

      // 2. Total Equipment Count
      const totalEquipment = await this.equipmentRepo.count();

      // 3. Active Rentals
      const activeRentals = await this.reservationRepo.count({
        where: { status: 'ACTIVE' as ReservationStatus },
      });

      // 4. Total Revenue (Sum payments safely)
      let totalRevenue = 0;
      try {
        const payments = await this.paymentRepo.find({
          where: { status: 'PAID' as PaymentStatus },
        });
        totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      } catch (err) {
        console.warn('Payment fetch failed in dashboard:', err);
      }

      // 5. Equipment Utilization Rate (%)
      const equipmentUtilization = totalEquipment > 0 
        ? Math.round((activeRentals / totalEquipment) * 100) 
        : 0;

      // 6. Monthly Reservation Trends
      let reservationTrends: { month: string; reservations: number }[] = [];
      try {
        const allReservations = await this.reservationRepo.find({
          where: { status: Not(In(excludedReservationStatuses)) as any },
          order: { createdAt: 'ASC' },
        });
        const monthlyCounts: { [key: string]: number } = {};

        allReservations.forEach((r) => {
          if (r.createdAt) {
            const month = new Date(r.createdAt).toLocaleString('default', { month: 'short' });
            monthlyCounts[month] = (monthlyCounts[month] + 1 || 1);
          }
        });

        reservationTrends = Object.keys(monthlyCounts).map((month) => ({
          month,
          reservations: monthlyCounts[month],
        }));
      } catch (err) {
        console.warn('Reservation trends calculation failed:', err);
      }

      // 7. Most Rented Equipment (Fixed using QueryBuilder to get real counts from relations)
      let mostRentedEquipment: { name: string; rentalsCount: number }[] = [];
      try {
        const topEquipmentQuery = await this.equipmentRepo
          .createQueryBuilder('equipment')
          .leftJoin('equipment.reservationItems', 'item')
          .leftJoin('item.reservation', 'reservation')
          .andWhere('reservation.status NOT IN (:...excludedStatuses)', { excludedStatuses: excludedReservationStatuses })
          .select('equipment.name', 'name')
          .addSelect('COUNT(item.id)', 'rentalsCount')
          .groupBy('equipment.id')
          .orderBy('COUNT(item.id)', 'DESC')
          .limit(5)
          .getRawMany();

        mostRentedEquipment = topEquipmentQuery.map((eq) => ({
          name: eq.name || 'Equipment Item',
          rentalsCount: Number(eq.rentalsCount || 0),
        }));
      } catch (err) {
        console.warn('Most rented equipment fetch failed:', err);
      }

      return {
        totalRevenue,
        activeRentals,
        totalCustomers,
        totalEquipment,
        equipmentUtilization,
        reservationTrends,
        mostRentedEquipment,
      };
    } catch (error) {
      console.error('Fatal Error in DashboardService.getStats:', error);
      return {
        totalRevenue: 0,
        activeRentals: 0,
        totalCustomers: 0,
        totalEquipment: 0,
        equipmentUtilization: 0,
        reservationTrends: [],
        mostRentedEquipment: [],
      };
    }
  }
}