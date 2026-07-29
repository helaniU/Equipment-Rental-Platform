import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum InventoryActionType {
  RECEIVE = 'RECEIVE',
  RELEASE = 'RELEASE',
  DAMAGE = 'DAMAGE',
  MAINTENANCE = 'MAINTENANCE',
}

export class RecordInventoryActionDto {
  @ApiProperty({ example: 'equipment-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  equipmentId!: string;

  @ApiProperty({ enum: InventoryActionType, example: InventoryActionType.DAMAGE })
  @IsEnum(InventoryActionType)
  action!: InventoryActionType;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'Lens scratch noticed during check-in', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'reservation-uuid-here', required: false })
  @IsUUID()
  @IsOptional()
  reservationId?: string;
}