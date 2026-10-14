import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../database/prisma.service';

/** Roles whose last holder must not be able to delete their own account. */
const ADMIN_ROLES = ['ADMIN', 'MANAGING_PARTNER'];

@Injectable()
export class AccountDeletionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Self-service account deletion. Every relation to the user (roles, tokens, sessions, login history,
   * client/case assignments, notifications) cascades from the user row. The user's AI conversations,
   * memory, usage logs, recommendations, workflow runs and daily plans carry no relation, so they are
   * deleted here: they can contain client information. Audit rows stay (they are the firm's trail) but
   * lose the IP address and user agent. Billing time entries stay; they carry only an id.
   */
  async deleteOwnAccount(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('Hesap bulunamadı');
    if (user.isDemo) throw new ForbiddenException('Demo hesaplar silinemez');

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Şifre hatalı');
    }

    const isAdmin = user.roles.some((ur) => ADMIN_ROLES.includes(ur.role.name));
    if (isAdmin) {
      const otherAdmins = await this.prisma.user.count({
        where: {
          id: { not: userId },
          isActive: true,
          isDemo: false,
          deletedAt: null,
          roles: { some: { role: { name: { in: ADMIN_ROLES } } } },
        },
      });
      if (otherAdmins === 0) {
        throw new ConflictException('Son yönetici hesabı silinemez. Önce başka bir kullanıcıyı yönetici yapın');
      }
    }

    await this.prisma.$transaction([
      this.prisma.aIConversation.deleteMany({ where: { userId } }), // messages cascade
      this.prisma.aIMemory.deleteMany({ where: { userId } }),
      this.prisma.aIUsageLog.deleteMany({ where: { userId } }),
      this.prisma.aIRecommendation.deleteMany({ where: { userId } }), // actions cascade
      this.prisma.aIWorkflowExecution.deleteMany({ where: { userId } }),
      this.prisma.aIDailyPlan.deleteMany({ where: { userId } }),
      this.prisma.auditLog.updateMany({ where: { userId }, data: { ipAddress: null, userAgent: null } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }
}
