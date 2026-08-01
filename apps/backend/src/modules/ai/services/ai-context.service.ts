import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  clientCount: number;
  caseCount: number;
  activeCaseCount: number;
  upcomingDeadlines: number;
  todayTasks: number;
}

@Injectable()
export class AIContextService {
  private readonly logger = new Logger(AIContextService.name);
  private contextCache = new Map<string, { data: UserProfile; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 dakika

  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string, useCache: boolean = true): Promise<UserProfile> {
    try {
      // Cache kontrolü
      if (useCache) {
        const cached = this.contextCache.get(userId);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          return cached.data;
        }
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Rol adını al
      const primaryRole = user.roles.length > 0 ? user.roles[0].role.name : 'USER';

      // Müvekkil sayısı (ClientLawyer tablosu üzerinden)
      const clientCount = await this.prisma.clientLawyer.count({
        where: { userId },
      });

      // Toplam dava sayısı (CaseLawyer tablosu üzerinden)
      const caseCount = await this.prisma.caseLawyer.count({
        where: { userId },
      });

      // Aktif dava sayısı
      const activeCaseCount = await this.prisma.case.count({
        where: {
          lawyers: {
            some: {
              userId,
            },
          },
          status: 'ACTIVE',
        },
      });

      // Yaklaşan son teslim tarihleri (sonraki 7 gün içinde)
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const upcomingDeadlines = await this.prisma.caseTask.count({
        where: {
          case: {
            lawyers: {
              some: {
                userId,
              },
            },
          },
          dueDate: {
            gte: today,
            lte: nextWeek,
          },
          completed: false,
        },
      });

      // Bugünkü görevler
      const todayTasks = await this.prisma.caseTask.count({
        where: {
          case: {
            lawyers: {
              some: {
                userId,
              },
            },
          },
          dueDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lte: new Date(today.setHours(23, 59, 59, 999)),
          },
          completed: false,
        },
      });

      const profile: UserProfile = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: primaryRole,
        clientCount,
        caseCount,
        activeCaseCount,
        upcomingDeadlines,
        todayTasks,
      };

      // Cache'e kaydet
      this.contextCache.set(userId, { data: profile, timestamp: Date.now() });

      return profile;
    } catch (error) {
      this.logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  invalidateCache(userId: string): void {
    this.contextCache.delete(userId);
  }

  clearCache(): void {
    this.contextCache.clear();
  }

  async getContextSummary(userId: string): Promise<string> {
    try {
      const profile = await this.getUserProfile(userId);

      const roleNames: Record<string, string> = {
        LAWYER: 'Avukat',
        ASSOCIATE: 'Ortak Avukat',
        PARALEGAL: 'Hukuk Asistanı',
        SECRETARY: 'Sekreter',
        ADMIN: 'Yönetici',
      };

      const roleName = roleNames[profile.role] || profile.role;

      return `
Kullanıcı Profili:
- İsim: ${profile.name}
- Rol: ${roleName}
- E-posta: ${profile.email}
- Toplam Müvekkil Sayısı: ${profile.clientCount}
- Toplam Dava Sayısı: ${profile.caseCount}
- Aktif Dava Sayısı: ${profile.activeCaseCount}
- Yaklaşan Son Teslim Tarihleri (7 gün içinde): ${profile.upcomingDeadlines}
- Bugünkü Görevler: ${profile.todayTasks}
`.trim();
    } catch (error) {
      this.logger.error('Error getting context summary:', error);
      return '';
    }
  }

  async getRecentActivity(userId: string, limit: number = 5): Promise<string> {
    try {
      // Son aktiviteleri getir (davalar, görevler, müvekkiller)
      const recentCases = await this.prisma.case.findMany({
        where: {
          lawyers: {
            some: {
              userId,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: Math.ceil(limit / 2),
        select: {
          title: true,
          status: true,
          updatedAt: true,
        },
      });

      const recentTasks = await this.prisma.caseTask.findMany({
        where: {
          case: {
            lawyers: {
              some: {
                userId,
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: Math.floor(limit / 2),
        select: {
          title: true,
          completed: true,
          dueDate: true,
        },
      });

      let activityText = '\n\nSon Aktiviteler:\n';

      if (recentCases.length > 0) {
        activityText += '\nSon Davalar:\n';
        recentCases.forEach((c) => {
          activityText += `- ${c.title} (${c.status}) - ${new Date(c.updatedAt).toLocaleDateString('tr-TR')}\n`;
        });
      }

      if (recentTasks.length > 0) {
        activityText += '\nSon Görevler:\n';
        recentTasks.forEach((t) => {
          activityText += `- ${t.title} (${t.completed ? 'Tamamlandı' : 'Bekliyor'}) - ${t.dueDate ? new Date(t.dueDate).toLocaleDateString('tr-TR') : 'Tarih yok'}\n`;
        });
      }

      return activityText.trim();
    } catch (error) {
      this.logger.error('Error getting recent activity:', error);
      return '';
    }
  }

  async getFullContext(userId: string): Promise<string> {
    try {
      const profileSummary = await this.getContextSummary(userId);
      const recentActivity = await this.getRecentActivity(userId);

      return `${profileSummary}${recentActivity}`;
    } catch (error) {
      this.logger.error('Error getting full context:', error);
      return '';
    }
  }

  async saveToMemory(userId: string, context: string): Promise<void> {
    try {
      const today = new Date();
      const cacheKey = `user_context_${userId}_${today.toISOString().split('T')[0]}`;

      const existing = await this.prisma.aIMemory.findFirst({
        where: {
          userId,
          key: cacheKey,
        },
      });

      if (existing) {
        await this.prisma.aIMemory.update({
          where: { id: existing.id },
          data: { value: context },
        });
      } else {
        await this.prisma.aIMemory.create({
          data: {
            userId,
            key: cacheKey,
            value: context,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error saving context to memory:', error);
    }
  }

  async getFromMemory(userId: string): Promise<string | null> {
    try {
      const today = new Date();
      const cacheKey = `user_context_${userId}_${today.toISOString().split('T')[0]}`;

      const cached = await this.prisma.aIMemory.findFirst({
        where: {
          userId,
          key: cacheKey,
        },
      });

      return cached?.value || null;
    } catch (error) {
      this.logger.error('Error getting context from memory:', error);
      return null;
    }
  }
}
