import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadType } from '../../database/entities/upload.entity';

export class UploadDocumentDto {
  @ApiProperty({ enum: UploadType, example: UploadType.IDENTITY_DOCUMENT })
  @IsEnum(UploadType)
  @IsNotEmpty()
  type: UploadType;
}