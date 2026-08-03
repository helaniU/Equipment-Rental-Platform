import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload, UploadType } from '../database/entities/upload.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
  ) {}

  async saveFileRecord(
    user: User,
    file: Express.Multer.File,
    type: UploadType,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Constructs path for local storage serving
    const fileUrl = `/uploads/${file.filename}`;

    const uploadRecord = this.uploadRepo.create({
      user,
      filename: file.originalname,
      url: fileUrl,
      type,
      mimeType: file.mimetype,
    });

    return this.uploadRepo.save(uploadRecord);
  }

  async findUserUploads(user: User) {
    return this.uploadRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }
}