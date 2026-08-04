import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';

export const notificationWorker = new Worker(
  'notifications', // 👈 මෙහි නම අනෙක් තැන්වල මෙන් 'notifications' විය යුතුය
  async (job: Job) => {
    console.log(`⏳ Processing Job ID: ${job.id} | Type: ${job.name}`);

    switch (job.name) {
      case 'RENTAL_CONFIRMATION':
        // 📧 Email හෝ Notification යැවීමේ Logic එක මෙතැනට:
        console.log(`✉️ Sending Rental Status Update to Email: ${job.data.email} | Status: ${job.data.status}`);
        // await sendEmail(job.data);
        break;

      case 'OVERDUE_REMINDER':
        console.log(`⚠️ Sending Overdue Reminder for Reservation: ${job.data.reservationId}`);
        break;

      case 'UPCOMING_RETURN_REMINDER':
        console.log(`⏰ Sending Upcoming Return Reminder for Reservation: ${job.data.reservationId} to ${job.data.email}`);
        // 📧 මෙතැනින් email යැවීමේ කටයුතු සිදු කළ හැක
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