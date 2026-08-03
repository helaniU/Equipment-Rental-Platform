import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../enums/reservation-status.enum';

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.APPROVED })
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;

  @ApiPropertyOptional({ example: 'Equipment currently undergoing maintenance' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}