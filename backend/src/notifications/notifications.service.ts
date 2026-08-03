import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private queue: Queue;
  private worker: Worker;

  onModuleInit() {
    const connection = { host: '127.0.0.1', port: 6379 };

    // Initialize Queue
    this.queue = new Queue('notification-queue', { connection });

    // Initialize Worker
    this.worker = new Worker(
      'notification-queue',
      async (job) => {
        console.log(`⏳ [BullMQ] Processing Job ${job.id} of type ${job.name}`);
        if (job.name === 'RENTAL_CONFIRMATION') {
          console.log(`✉️ Sending Rental Email to: ${job.data.email}`);
        }
      },
      { connection }
    );

    console.log('✅ Connected to Redis & BullMQ Worker initialized!');
  }

  async addNotification(type: string, data: any) {
    await this.queue.add(type, data);
  }
}