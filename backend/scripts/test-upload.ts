import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from '../src/uploads/uploads.service';
import { UploadType } from '../src/database/entities/upload.entity';

// Minimal mock ConfigService with get(name) method
const mockConfig: Partial<ConfigService> = {
  get: (key: string) => {
    // Return no AWS config to force local fallback
    return undefined;
  },
};

// Minimal mock repository with create and save
const mockRepo: any = {
  storage: [] as any[],
  create: function (obj: any) {
    return { id: `mock-${Date.now()}`, ...obj };
  },
  save: async function (record: any) {
    this.storage.push(record);
    return record;
  },
};

async function runTest() {
  const uploadsService = new UploadsService(mockConfig as ConfigService, mockRepo);

  const file = {
    originalname: 'test-file.txt',
    mimetype: 'text/plain',
    buffer: Buffer.from('hello world test upload'),
  } as Express.Multer.File;

  const user = { id: 'test-user', email: 'tester@example.com' } as any;

  try {
    const result = await uploadsService.saveFileRecord(user, file, UploadType.IDENTITY_DOCUMENT);
    console.log('Upload result:', result);
    process.exit(0);
  } catch (err: any) {
    console.error('Test upload failed:', err);
    process.exit(1);
  }
}

runTest();
