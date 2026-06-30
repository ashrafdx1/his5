import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, NotificationPayload } from './notifications.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send transactional alerts (Email, SMS, In-App)' })
  @ApiResponse({ status: 201, description: 'Notification successfully enqueued/dispatched.' })
  async sendNotification(@Body() payload: NotificationPayload) {
    return this.notificationsService.broadcast(payload);
  }
}
