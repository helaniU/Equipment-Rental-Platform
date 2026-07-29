import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Lighting & Grip' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Studio lights, softboxes, and stands', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}