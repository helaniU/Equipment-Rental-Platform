import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryActionType } from '../../database/entities/inventory-log.entity';

export class RecordInventoryActionDto {
  @ApiProperty({ example: 'uuid-of-equipment' })
  @IsUUID()
  @IsNotEmpty()
  equipmentId: string;

  @ApiProperty({ enum: InventoryActionType, example: InventoryActionType.DAMAGE })
  @IsEnum(InventoryActionType)
  @IsNotEmpty()
  action: InventoryActionType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Lens scratch reported upon return' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 150.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  repairCost?: number;
}