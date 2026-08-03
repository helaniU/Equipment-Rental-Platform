import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  rentalPrice: number;

  @IsNumber()
  @Min(0)
  deposit: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}