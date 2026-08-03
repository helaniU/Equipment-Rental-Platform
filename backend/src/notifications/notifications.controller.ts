import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications') // 👈 Route Prefix එක /notifications
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test') // 👈 Sub-route එක /test (ගැළපුනාම /notifications/test)
  async sendTestNotification(@Body() body: { email: string; reservationId?: string }) {
    await this.notificationsService.addNotification('RENTAL_CONFIRMATION', {
      email: body.email || 'testuser@gmail.com',
      reservationId: body.reservationId || 'RES-999',
    });

    return {
      success: true,
      message: 'Job pushed to BullMQ successfully!',
    };
  }
}