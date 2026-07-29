import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from '../database/entities/reservation.entity';
import { ReservationItem } from '../database/entities/reservation-item.entity';
import { Equipment } from '../database/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationItem, Equipment])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}