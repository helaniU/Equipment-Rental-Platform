import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Sony A7 IV Digital Camera' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Full-frame mirrorless camera suitable for video and photo production.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 45.00 })
  @IsNumber()
  @Min(0)
  rentalPrice!: number;

  @ApiProperty({ example: 200.00 })
  @IsNumber()
  @Min(0)
  deposit!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: { sensor: '33MP Full-Frame', video: '4K 60p' }, required: false })
  @IsOptional()
  specifications?: Record<string, any>;
}