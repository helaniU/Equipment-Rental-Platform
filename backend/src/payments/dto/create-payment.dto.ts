import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'reservation-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  reservationId!: string;

  @ApiProperty({ example: 180.00 })
  @IsNumber()
  @Min(0)
  amount!: number;
}