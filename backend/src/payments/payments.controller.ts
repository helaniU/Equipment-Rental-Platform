import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../database/entities/role.entity';
import { PaymentStatus } from '../database/entities/payment.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process a mock payment for a reservation' })
  processPayment(@Request() req: any, @Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(req.user, dto);
  }

  @Patch(':id/status')
  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Update payment status (Admin/Staff only)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.updateStatus(id, status);
  }

  @Put(':id/refund')
  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Refund a completed payment (Admin/Staff only)' })
  refundPayment(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(id, req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get payment history' })
  findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.findOne(id, req.user);
  }
}