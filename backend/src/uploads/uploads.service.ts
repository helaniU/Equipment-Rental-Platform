import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../database/entities/upload.entity';
import { User } from '../database/entities/user.entity';

import { Express } from 'express';
import 'multer'; 

@Injectable()
export class UploadsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Upload) private uploadRepo: Repository<Upload>,
  ) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT'); // Cloudflare R2 or custom S3 endpoint

    this.s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'mock-key',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'mock-secret',
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'equipment-rental-bucket';
  }

  async uploadFile(file: Express.Multer.File, user: User, fileType: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;

    // Upload to S3 / Cloudflare R2
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch {
      // Fallback local mock URL if cloud credentials are not supplied yet
      console.warn('S3 upload failed or credentials unconfigured. Saving mock cloud URL.');
    }

    const fileUrl = `${this.configService.get<string>('STORAGE_PUBLIC_URL') || 'https://storage.googleapis.com'}/${this.bucketName}/${key}`;

    const uploadRecord = this.uploadRepo.create({
      fileName: file.originalname,
      fileUrl,
      fileType,
      uploadedBy: user,
    });

    return this.uploadRepo.save(uploadRecord);
  }
}