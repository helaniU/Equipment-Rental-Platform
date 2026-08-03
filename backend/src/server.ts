import express from 'express';
import dotenv from 'dotenv';

// 💡 1. Worker එක Start වීමට මෙතන Import කරගන්න:
import './workers/notification.worker';

// 💡 2. Queue Producer එක Import කරගන්න:
import { addNotificationJob } from './queues/notification.queue';

dotenv.config();

const app = express();
app.use(express.json());

// ... ඔයාගේ අනික් routes සහ middlewares මෙතන තියෙනවා ...

// 🧪 3. Async Queue එක Test කිරීමට Endpoint එකක්:
app.post('/api/test-notification', async (req, res) => {
  try {
    const { email, reservationId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Background job එක Queue එකට එකතු කිරීම
    await addNotificationJob('RENTAL_CONFIRMATION', {
      email,
      reservationId: reservationId || 'RES-1001',
    });

    // Client එකට Instant response එකක් යනවා (Worker එක background එකේ process වෙනවා)
    return res.status(200).json({
      success: true,
      message: 'Notification queued successfully!',
    });
  } catch (error: any) {
    console.error('Queue Error:', error);
    return res.status(500).json({ message: 'Failed to queue notification' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});