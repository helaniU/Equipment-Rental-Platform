import { Controller, Post, Get, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../database/entities/role.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Process payment for a reservation' })
  checkout(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Get payment history for a specific reservation' })
  getByReservation(@Param('reservationId') reservationId: string) {
    return this.paymentsService.findByReservation(reservationId);
  }

  @Patch(':id/refund')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Process payment refund (Admin only)' })
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }
}