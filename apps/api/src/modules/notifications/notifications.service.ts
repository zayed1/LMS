import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async send(data: { userId: string; type: NotificationType; titleAr: string; titleEn?: string; messageAr: string; messageEn?: string; link?: string }) {
    return this.prisma.notification.create({ data });
  }

  async sendToMany(userIds: string[], data: { type: NotificationType; titleAr: string; titleEn?: string; messageAr: string; messageEn?: string; link?: string }) {
    return this.prisma.notification.createMany({
      data: userIds.map(userId => ({ ...data, userId })),
    });
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { data, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
