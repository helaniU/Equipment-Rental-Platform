import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '../../database/entities/payment.entity';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'uuid-of-reservation' })
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentType, example: PaymentType.RENTAL_FEE })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @ApiPropertyOptional({ example: 'MOCK_CARD' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: false, description: 'Set to true to test payment failure flow' })
  @IsOptional()
  simulateFailure?: boolean;
}

export class RefundPaymentDto {
  @ApiPropertyOptional({ example: 'Customer cancelled prior to pickup' })
  @IsString()
  @IsOptional()
  reason?: string;
}