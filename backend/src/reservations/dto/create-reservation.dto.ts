import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationItemDto {
  @ApiProperty({ example: 'equipment-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  equipmentId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateReservationDto {
  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  pickupDate!: string;

  @ApiProperty({ example: '2026-08-05' })
  @IsDateString()
  returnDate!: string;

  @ApiProperty({ type: [ReservationItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items!: ReservationItemDto[];
}