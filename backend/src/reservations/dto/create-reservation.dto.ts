// backend/src/reservations/dto/create-reservation.dto.ts
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReservationItemDto {
  @ApiProperty({ example: 'uuid-of-equipment' })
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class CreateReservationDto {
  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  @IsNotEmpty()
  pickupDate: string;

  @ApiProperty({ example: '2026-08-05' })
  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @ApiProperty({ type: [ReservationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items: ReservationItemDto[];
}