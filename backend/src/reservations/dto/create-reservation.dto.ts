import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationItemDto {
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  pickupDate: string;

  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items: ReservationItemDto[];
}