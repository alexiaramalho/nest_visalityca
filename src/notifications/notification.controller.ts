import { Controller, Get, Sse, Param, Patch } from '@nestjs/common';
import { Observable, map, filter } from 'rxjs';
import { NotificationService, NotificationData } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('unread/:userId')
  async getUnreadNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  @Patch('read/:id')
  async markAsRead(@Param('id') id: string) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }

  @Sse(':userId')
  notifications(@Param('userId') userId: string): Observable<any> {
    return this.notificationService.getNotifications().pipe(
      filter((notification) => notification.userId === userId),
      map((notification: NotificationData) => ({
        data: JSON.stringify(notification),
      })),
    );
  }
}