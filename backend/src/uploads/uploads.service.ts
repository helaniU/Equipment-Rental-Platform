import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload, UploadType } from '../database/entities/upload.entity';
import { User } from '../database/entities/user.entity';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Upload) private readonly uploadRepo: Repository<Upload>,
  ) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const endpoint = this.configService.get<string>('AWS_ENDPOINT'); // Cloudflare R2 endpoint

    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || null;

    if (this.bucketName && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        endpoint: endpoint ? endpoint : undefined,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        forcePathStyle: !!endpoint,
      });
    } else {
      this.s3Client = null; // operate in local fallback mode
    }
  }

  private async uploadToCloud(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error('S3 client or bucket not configured');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const key = `uploads/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const endpoint = this.configService.get<string>('AWS_ENDPOINT');
    let fileUrl = '';
    if (endpoint) {
      // If custom endpoint provided (e.g., Cloudflare R2)
      fileUrl = `${endpoint.replace(/\/$/, '')}/${this.bucketName}/${key}`;
    } else {
      const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
      fileUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    }

    return { url: fileUrl, key };
  }

  private async saveLocally(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, file.buffer);

    return { url: `/uploads/${fileName}`, key: fileName };
  }

  async saveFileRecord(user: User, file: Express.Multer.File, type: UploadType) {
    if (!file) throw new BadRequestException('File is required');

    let uploadResult: { url: string; key: string } | null = null;

    try {
      if (this.s3Client && this.bucketName) {
        uploadResult = await this.uploadToCloud(file);
      } else {
        uploadResult = await this.saveLocally(file);
      }
    } catch (err) {
      console.error('Upload failed, falling back to local storage:', err);
      uploadResult = await this.saveLocally(file);
    }

    const uploadRecord = this.uploadRepo.create({
      user,
      filename: file.originalname,
      url: uploadResult.url,
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