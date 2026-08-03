import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';

export const notificationWorker = new Worker(
  'notification-queue',
  async (job: Job) => {
    console.log(`⏳ Processing Job ID: ${job.id} | Type: ${job.name}`);

    switch (job.name) {
      case 'RENTAL_CONFIRMATION':
        // 📧 Email හෝ Notification යැවීමේ Logic එක මෙතැනට:
        console.log(`✉️ Sending Rental Confirmation to ${job.data.email}`);
        // await sendEmail(job.data);
        break;

      case 'OVERDUE_REMINDER':
        console.log(`⚠️ Sending Overdue Reminder for Reservation: ${job.data.reservationId}`);
        break;

      default:
        console.warn(`Unknown job type: ${job.name}`);
    }
  },
  { connection: redisConnection }
);

notificationWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully!`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err.message);
});