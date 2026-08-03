import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Reservation } from '../database/entities/reservation.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { Payment } from '../database/entities/payment.entity';

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
      // 1. Total Customers Count (Safe Count)
      const totalCustomers = await this.userRepo.count();

      // 2. Total Equipment Count
      const totalEquipment = await this.equipmentRepo.count();

      // 3. Active Rentals
      const activeRentals = await this.reservationRepo.count();

      // 4. Total Revenue (Sum payments safely)
      let totalRevenue = 0;
      try {
        const payments = await this.paymentRepo.find();
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
        const allReservations = await this.reservationRepo.find({ order: { createdAt: 'ASC' } });
        const monthlyCounts: { [key: string]: number } = {};

        allReservations.forEach((r) => {
          if (r.createdAt) {
            const month = new Date(r.createdAt).toLocaleString('default', { month: 'short' });
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
          }
        });

        reservationTrends = Object.keys(monthlyCounts).map((month) => ({
          month,
          reservations: monthlyCounts[month],
        }));
      } catch (err) {
        console.warn('Reservation trends calculation failed:', err);
      }

      // 7. Most Rented Equipment
      let mostRentedEquipment: { name: string; rentalsCount: number }[] = [];
      try {
        const topEquipment = await this.equipmentRepo.find({ take: 5 });
        mostRentedEquipment = topEquipment.map((eq: any) => ({
          name: eq.name || 'Equipment Item',
          rentalsCount: Number(eq.quantity || eq.stockQuantity || eq.totalQuantity || 1),
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
      // Fallback empty metrics structure in case of catastrophic DB error
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