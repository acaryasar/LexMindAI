import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHearingScheduleReport(filter?: 'upcoming' | 'past' | 'all', userId?: string, userRole?: string) {
    const where: any = {};
    
    // Apply role-based filtering
    if (userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER') {
      where.case = {
        lawyers: {
          some: { userId },
        },
      };
    }

    const hearings = await this.prisma.caseHearing.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    let filteredHearings = hearings.map((hearing: any) => ({
      id: hearing.id,
      caseId: hearing.case.caseNumber,
      caseTitle: hearing.case.title,
      date: hearing.date,
      time: hearing.time,
      location: hearing.location,
      status: new Date(hearing.date) >= new Date() ? 'upcoming' : 'past',
    }));

    // Apply date filter
    if (filter === 'upcoming') {
      filteredHearings = filteredHearings.filter((h: any) => new Date(h.date) >= new Date());
    } else if (filter === 'past') {
      filteredHearings = filteredHearings.filter((h: any) => new Date(h.date) < new Date());
    }

    return filteredHearings;
  }

  async getAIAnalysisReport(userId?: string, userRole?: string) {
    // Return mock data for now as AIAnalysis model doesn't exist in schema
    return [];
  }

  async getCaseStatusReport(filter?: 'active' | 'pending' | 'completed' | 'all', userId?: string, userRole?: string) {
    const where: any = {};
    
    // Apply role-based filtering
    if (userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER') {
      where.lawyers = {
        some: { userId },
      };
    }

    // Apply status filter
    if (filter && filter !== 'all') {
      where.status = filter;
    }

    const cases = await this.prisma.case.findMany({
      where,
      include: {
        _count: {
          select: { clients: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cases.map((c: any) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      status: c.status,
      type: c.type,
      priority: 'medium', // Default value as priority field doesn't exist
      createdAt: c.createdAt,
      lastActivity: c.updatedAt,
    }));
  }

  async getClientReport(userId?: string, userRole?: string) {
    const where: any = {};
    
    // Apply role-based filtering if needed
    if (userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER') {
      where.lawyers = {
        some: { userId },
      };
    }

    const clients = await this.prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { cases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map((client: any) => ({
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      phone: client.phoneNumber,
      company: null, // Company field doesn't exist
      activeCases: 0, // Would need separate query
      totalCases: client._count.cases,
      lastActivity: client.updatedAt,
      status: client._count.cases > 0 ? 'active' : 'inactive',
    }));
  }

  async getFinanceReport(filter?: 'income' | 'expense' | 'all', userId?: string, userRole?: string) {
    // Return mock data for now as Transaction model doesn't exist in schema
    return [];
  }

  async getTaskReport(filter?: 'pending' | 'in_progress' | 'completed' | 'all', userId?: string, userRole?: string) {
    const where: any = {};
    
    // Apply status filter
    if (filter && filter !== 'all') {
      where.status = filter;
    }

    // Apply role-based filtering
    if (userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER') {
      where.case = {
        lawyers: {
          some: { userId },
        },
      };
    }

    const tasks = await this.prisma.caseTask.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: 'medium', // Default value
      dueDate: task.dueDate,
      assignedTo: 'Atanmış Kullanıcı', // Mock value as assignedTo doesn't exist
      caseId: task.case?.caseNumber,
    }));
  }

  async getActivityReport(filter?: 'case' | 'document' | 'finance' | 'ai' | 'hearing' | 'task' | 'all', userId?: string, userRole?: string) {
    // Return mock data for now as ActivityLog model doesn't exist in schema
    return [];
  }

  async getPerformanceReport(userId?: string, userRole?: string) {
    // Calculate case success rate
    const totalCases = await this.prisma.case.count({
      where: userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER' ? {
        lawyers: {
          some: { userId },
        },
      } : {},
    });

    const completedCases = await this.prisma.case.count({
      where: {
        ...(userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER' ? {
          lawyers: {
            some: { userId },
          },
        } : {}),
        status: 'completed',
      },
    });

    const caseSuccessRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

    // Calculate average case duration (in days)
    const casesWithDuration = await this.prisma.case.findMany({
      where: {
        ...(userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER' ? {
          lawyers: {
            some: { userId },
          },
        } : {}),
        status: 'completed',
        endDate: { not: null },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    const averageCaseDuration = casesWithDuration.length > 0
      ? Math.round(
          casesWithDuration.reduce((acc: number, c: any) => {
            const duration = Math.floor(
              (new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            return acc + duration;
          }, 0) / casesWithDuration.length
        )
      : 0;

    // Calculate task completion rate
    const totalTasks = await this.prisma.caseTask.count({
      where: userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER' ? {
        case: {
          lawyers: {
            some: { userId },
          },
        },
      } : {},
    });

    const completedTasks = await this.prisma.caseTask.count({
      where: {
        ...(userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER' ? {
          case: {
            lawyers: {
              some: { userId },
            },
          },
        } : {}),
      },
    });

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate active cases
    const activeCases = await this.prisma.case.count({
      where: {
        ...(userRole !== 'ADMIN' && userRole !== 'MANAGING_PARTNER' ? {
          lawyers: {
            some: { userId },
          },
        } : {}),
        status: 'active',
      },
    });

    return {
      caseSuccessRate,
      averageCaseDuration,
      taskCompletionRate,
      clientSatisfaction: 4.5, // Mock value
      revenueGrowth: 15, // Mock value
      activeCases,
      completedCases,
    };
  }
}
