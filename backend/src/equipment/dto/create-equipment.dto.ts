import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Sony FX3 Cinema Camera' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Full-frame Cinema Line camera with 4K resolution' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['https://s3-url.com/fx3.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 45.00 })
  @IsNumber()
  @Min(0)
  rentalPrice: number;

  @ApiProperty({ example: 200.00 })
  @IsNumber()
  @Min(0)
  deposit: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ example: { resolution: '4K', mount: 'E-mount' } })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateEquipmentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  rentalPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  deposit?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}