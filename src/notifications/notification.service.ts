import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { Notification } from './notification.entity';

export interface NotificationData {
  userId: string;
  type: 'deletion_request_created' | 'deletion_request_updated';
  message: string;
  data?: any;
}

@Injectable()
export class NotificationService {
  private notifications = new Subject<NotificationData>();

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async sendNotification(notification: NotificationData) {
    // Salvar no banco
    await this.notificationRepository.save({
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      data: notification.data,
    });

    // Enviar em tempo real
    this.notifications.next(notification);
  }

  async getUnreadNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string) {
    await this.notificationRepository.update(notificationId, { read: true });
  }

  getNotifications() {
    return this.notifications.asObservable();
  }
}