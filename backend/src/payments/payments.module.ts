import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../database/entities/payment.entity';
import { Reservation } from '../database/entities/reservation.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Reservation])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}