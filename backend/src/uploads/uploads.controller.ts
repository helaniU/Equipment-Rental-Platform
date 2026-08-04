import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { UploadType } from '../database/entities/upload.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('document')
  @ApiOperation({ summary: 'Upload an identity document or rental agreement to cloud storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: Object.values(UploadType) },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      // 👇 S3/R2 වෙත buffer යැවීම සඳහා memoryStorage භාවිතා කිරීම
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|pdf)$/i)) {
          return callback(
            new BadRequestException('Only image files and PDFs are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    }),
  )
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: UploadType,
  ) {
    // S3 වෙත upload කර, ලැබෙන URL එක database එකේ record එකක් ලෙස save කිරීම
    return this.uploadsService.saveFileRecord(req.user, file, type || UploadType.IDENTITY_DOCUMENT);
  }

  @Get('my-documents')
  @ApiOperation({ summary: 'Get list of uploaded documents for current user' })
  getUserUploads(@Request() req: any) {
    return this.uploadsService.findUserUploads(req.user);
  }
}