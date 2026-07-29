import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../database/entities/user.entity';
import { Reservation } from '../database/entities/reservation.entity';
import { Payment } from '../database/entities/payment.entity';
import { Equipment } from '../database/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reservation, Payment, Equipment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}