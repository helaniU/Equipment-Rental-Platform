import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// 'notification-queue' නමින් Queue එකක් create කිරීම
export const notificationQueue = new Queue('notification-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Job එක fail වුවහොත් 3 පාරක් retry කරනු ලැබේ
    backoff: {
      type: 'exponential',
      delay: 5000, // Retry අතර කාලය 5s, 10s ආදී වශයෙන් වැඩුවේ
    },
    removeOnComplete: true, // Complete වූ jobs auto clear වේ
    removeOnFail: false, // Fail වූ jobs debug කිරීමට තබා ගනී
  },
});

export const addNotificationJob = async (type: string, data: any) => {
  await notificationQueue.add(type, data);
};