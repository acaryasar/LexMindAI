import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

export type ScreenType = 'dashboard' | 'cases' | 'case-detail' | 'documents' | 'calendar' | 'clients' | 'finance';

interface ScreenContext {
  screenType: ScreenType;
  entityId?: string;
  userId: string;
}

@Injectable()
export class ScreenContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getScreenRecommendations(context: ScreenContext) {
    switch (context.screenType) {
      case 'dashboard':
        return this.getDashboardRecommendations(context.userId);
      case 'cases':
        return this.getCasesRecommendations(context.userId);
      case 'case-detail':
        return context.entityId 
          ? this.getCaseDetailRecommendations(context.userId, context.entityId)
          : [];
      case 'documents':
        return this.getDocumentsRecommendations(context.userId);
      case 'calendar':
        return this.getCalendarRecommendations(context.userId);
      case 'clients':
        return this.getClientsRecommendations(context.userId);
      case 'finance':
        return this.getFinanceRecommendations(context.userId);
      default:
        return [];
    }
  }

  private async getDashboardRecommendations(userId: string) {
    const recommendations = [];

    // Get today's hearings
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const hearings = await this.prisma.caseHearing.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        case: {
          lawyers: {
            some: { userId },
          },
        },
      },
      include: {
        case: true,
      },
    });

    if (hearings.length > 0) {
      recommendations.push({
        type: 'hearing',
        priority: 'critical',
        title: `${hearings.length} Hearing${hearings.length > 1 ? 's' : ''} Today`,
        description: 'You have hearings scheduled for today',
        reason: 'Hearings require preparation and attendance',
        businessImpact: 'High - Client satisfaction depends on hearing outcomes',
        legalImpact: 'Critical - Case progress depends on hearings',
        estimatedTime: hearings.length * 60,
        confidenceScore: 95,
        actions: [
          { type: 'summarize', label: 'Review Hearing Notes', requiresApproval: false },
          { type: 'schedule', label: 'Schedule Preparation', requiresApproval: true },
        ],
      });
    }

    // Get overdue tasks
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          lt: startOfDay,
        },
        status: {
          not: 'completed',
        },
        deletedAt: null,
      },
    });

    if (overdueTasks.length > 0) {
      recommendations.push({
        type: 'task',
        priority: 'high',
        title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
        description: 'You have tasks that are past their due date',
        reason: 'Overdue tasks may impact case timelines and client relationships',
        businessImpact: 'Medium - Client trust may be affected',
        legalImpact: 'Medium - Deadlines may be missed',
        estimatedTime: overdueTasks.length * 30,
        confidenceScore: 90,
        actions: [
          { type: 'assign_task', label: 'Review Tasks', requiresApproval: false },
          { type: 'schedule', label: 'Reschedule Deadlines', requiresApproval: true },
        ],
      });
    }

    // Get inactive clients
    const inactiveClients = await this.prisma.client.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        },
        deletedAt: null,
      },
      take: 5,
    });

    if (inactiveClients.length > 0) {
      recommendations.push({
        type: 'client',
        priority: 'medium',
        title: `${inactiveClients.length} Inactive Client${inactiveClients.length > 1 ? 's' : ''}`,
        description: 'Clients with no recent activity',
        reason: 'Regular client contact helps maintain relationships and identify new opportunities',
        businessImpact: 'Medium - Revenue opportunities may be lost',
        legalImpact: 'Low - No immediate legal impact',
        estimatedTime: inactiveClients.length * 15,
        confidenceScore: 85,
        actions: [
          { type: 'create_reminder', label: 'Schedule Follow-up', requiresApproval: false },
          { type: 'schedule', label: 'Send Update', requiresApproval: true },
        ],
      });
    }

    return recommendations;
  }

  private async getCasesRecommendations(userId: string) {
    const recommendations = [];

    // Get cases with upcoming deadlines
    const cases = await this.prisma.case.findMany({
      where: {
        lawyers: {
          some: { userId },
        },
        status: 'active',
        deletedAt: null,
      },
      include: {
        hearings: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 3,
        },
      },
    });

    const casesWithDeadlines = cases.filter((c) => c.hearings.length > 0);

    if (casesWithDeadlines.length > 0) {
      recommendations.push({
        type: 'case',
        priority: 'high',
        title: `${casesWithDeadlines.length} Case${casesWithDeadlines.length > 1 ? 's' : ''} with Upcoming Deadlines`,
        description: 'Cases with hearings or deadlines in the next 7 days',
        reason: 'Upcoming deadlines require preparation and attention',
        businessImpact: 'High - Case outcomes depend on timely preparation',
        legalImpact: 'Critical - Missing deadlines may have legal consequences',
        estimatedTime: casesWithDeadlines.length * 45,
        confidenceScore: 92,
        actions: [
          { type: 'summarize', label: 'Review Case Status', requiresApproval: false },
          { type: 'search', label: 'Check Precedents', requiresApproval: false },
        ],
      });
    }

    // Get cases with missing evidence
    recommendations.push({
      type: 'case',
      priority: 'medium',
      title: 'Review Case Evidence',
      description: 'Check if all required evidence is collected',
      reason: 'Complete evidence is crucial for case success',
      businessImpact: 'Medium - Case strength depends on evidence',
      legalImpact: 'High - Missing evidence may weaken legal position',
      estimatedTime: 30,
      confidenceScore: 80,
      actions: [
        { type: 'analyze', label: 'Generate Evidence Checklist', requiresApproval: false },
        { type: 'create_reminder', label: 'Set Evidence Collection Reminder', requiresApproval: false },
      ],
    });

    return recommendations;
  }

  private async getCaseDetailRecommendations(userId: string, caseId: string) {
    if (!caseId) return [];

    const recommendations = [];

    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        hearings: {
          orderBy: { date: 'asc' },
          take: 1,
        },
        documents: true,
        tasks: {
          where: { completed: false },
        },
      },
    });

    if (!caseData) return [];

    // Next hearing
    if (caseData.hearings.length > 0) {
      const nextHearing = caseData.hearings[0];
      const daysUntilHearing = Math.ceil(
        (nextHearing.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilHearing <= 7) {
        recommendations.push({
          type: 'hearing',
          priority: 'critical',
          title: `Hearing in ${daysUntilHearing} Day${daysUntilHearing > 1 ? 's' : ''}`,
          description: `Next hearing on ${nextHearing.date.toLocaleDateString()}`,
          reason: 'Hearing preparation is time-sensitive',
          businessImpact: 'High - Client satisfaction depends on hearing outcome',
          legalImpact: 'Critical - Case progress depends on hearing',
          estimatedTime: 60,
          confidenceScore: 95,
          actions: [
            { type: 'summarize', label: 'Generate Hearing Brief', requiresApproval: false },
            { type: 'search', label: 'Find Similar Cases', requiresApproval: false },
            { type: 'schedule', label: 'Schedule Prep Meeting', requiresApproval: true },
          ],
        });
      }
    }

    // Pending tasks
    if (caseData.tasks.length > 0) {
      recommendations.push({
        type: 'task',
        priority: 'high',
        title: `${caseData.tasks.length} Pending Task${caseData.tasks.length > 1 ? 's' : ''}`,
        description: 'Tasks related to this case need attention',
        reason: 'Pending tasks may delay case progress',
        businessImpact: 'Medium - Case timeline may be affected',
        legalImpact: 'Medium - Deadlines may be at risk',
        estimatedTime: caseData.tasks.length * 20,
        confidenceScore: 88,
        actions: [
          { type: 'assign_task', label: 'Review Tasks', requiresApproval: false },
          { type: 'schedule', label: 'Update Timeline', requiresApproval: true },
        ],
      });
    }

    // Document analysis
    if (caseData.documents.length > 0) {
      recommendations.push({
        type: 'document',
        priority: 'medium',
        title: 'Analyze Case Documents',
        description: `${caseData.documents.length} document${caseData.documents.length > 1 ? 's' : ''} available for analysis`,
        reason: 'Document analysis can reveal key insights and contradictions',
        businessImpact: 'Medium - Better understanding strengthens case strategy',
        legalImpact: 'High - Document analysis may reveal critical evidence',
        estimatedTime: 45,
        confidenceScore: 85,
        actions: [
          { type: 'summarize', label: 'Generate Document Summary', requiresApproval: false },
          { type: 'analyze', label: 'Extract Key Arguments', requiresApproval: false },
          { type: 'search', label: 'Find Contradictions', requiresApproval: false },
        ],
      });
    }

    return recommendations;
  }

  private async getDocumentsRecommendations(userId: string) {
    const recommendations = [];

    // Recently uploaded documents
    const recentDocuments = await this.prisma.document.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
        deletedAt: null,
      },
      take: 5,
    });

    if (recentDocuments.length > 0) {
      recommendations.push({
        type: 'document',
        priority: 'high',
        title: `${recentDocuments.length} New Document${recentDocuments.length > 1 ? 's' : ''}`,
        description: 'Documents uploaded in the last 7 days',
        reason: 'New documents may contain important information',
        businessImpact: 'Medium - New information may affect case strategy',
        legalImpact: 'High - New documents may be critical evidence',
        estimatedTime: recentDocuments.length * 15,
        confidenceScore: 90,
        actions: [
          { type: 'summarize', label: 'Generate Summaries', requiresApproval: false },
          { type: 'analyze', label: 'Extract Key Points', requiresApproval: false },
        ],
      });
    }

    // Document organization
    recommendations.push({
      type: 'document',
      priority: 'low',
      title: 'Organize Documents',
      description: 'Review and categorize documents',
      reason: 'Well-organized documents improve efficiency',
      businessImpact: 'Low - Improves workflow efficiency',
      legalImpact: 'Low - Better document organization',
      estimatedTime: 30,
      confidenceScore: 75,
      actions: [
        { type: 'analyze', label: 'Auto-categorize Documents', requiresApproval: false },
        { type: 'create_reminder', label: 'Set Organization Reminder', requiresApproval: false },
      ],
    });

    return recommendations;
  }

  private async getCalendarRecommendations(userId: string) {
    const recommendations = [];

    // Today's events
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayEvents = await this.prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        deletedAt: null,
      },
    });

    if (todayEvents.length > 0) {
      recommendations.push({
        type: 'event',
        priority: 'high',
        title: `${todayEvents.length} Event${todayEvents.length > 1 ? 's' : ''} Today`,
        description: 'You have events scheduled for today',
        reason: 'Events require preparation and attendance',
        businessImpact: 'Medium - Events are important for client relationships',
        legalImpact: 'Low - Events may be administrative',
        estimatedTime: todayEvents.length * 30,
        confidenceScore: 95,
        actions: [
          { type: 'summarize', label: 'Review Event Details', requiresApproval: false },
          { type: 'schedule', label: 'Prepare Materials', requiresApproval: false },
        ],
      });
    }

    // Schedule optimization
    recommendations.push({
      type: 'calendar',
      priority: 'medium',
      title: 'Optimize Your Schedule',
      description: 'AI can suggest optimal time allocation',
      reason: 'Optimized scheduling improves productivity',
      businessImpact: 'Medium - Better time management',
      legalImpact: 'Low - Administrative improvement',
      estimatedTime: 15,
      confidenceScore: 80,
      actions: [
        { type: 'analyze', label: 'Analyze Schedule', requiresApproval: false },
        { type: 'schedule', label: 'Apply Optimizations', requiresApproval: true },
      ],
    });

    return recommendations;
  }

  private async getClientsRecommendations(userId: string) {
    const recommendations = [];

    // High-value clients
    recommendations.push({
      type: 'client',
      priority: 'medium',
      title: 'Review Client Portfolio',
      description: 'Analyze client relationships and opportunities',
      reason: 'Regular client review helps identify growth opportunities',
      businessImpact: 'High - Client relationships drive revenue',
      legalImpact: 'Low - Business-focused',
      estimatedTime: 30,
      confidenceScore: 85,
      actions: [
        { type: 'analyze', label: 'Generate Client Report', requiresApproval: false },
        { type: 'create_reminder', label: 'Schedule Review', requiresApproval: true },
      ],
    });

    // Client follow-ups
    const clientsNeedingFollowUp = await this.prisma.client.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
        deletedAt: null,
      },
      take: 5,
    });

    if (clientsNeedingFollowUp.length > 0) {
      recommendations.push({
        type: 'client',
        priority: 'medium',
        title: `${clientsNeedingFollowUp.length} Client${clientsNeedingFollowUp.length > 1 ? 's' : ''} Need Follow-up`,
        description: 'Clients with no recent contact',
        reason: 'Regular contact maintains client relationships',
        businessImpact: 'Medium - Client retention',
        legalImpact: 'Low - Business-focused',
        estimatedTime: clientsNeedingFollowUp.length * 10,
        confidenceScore: 88,
        actions: [
          { type: 'create_reminder', label: 'Schedule Follow-ups', requiresApproval: false },
          { type: 'schedule', label: 'Send Updates', requiresApproval: true },
        ],
      });
    }

    return recommendations;
  }

  private async getFinanceRecommendations(userId: string) {
    const recommendations = [];

    // Overdue invoices
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: 'paid',
        },
        deletedAt: null,
      },
    });

    if (overdueInvoices.length > 0) {
      recommendations.push({
        type: 'finance',
        priority: 'high',
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? 's' : ''}`,
        description: 'Invoices that are past their due date',
        reason: 'Overdue invoices affect cash flow',
        businessImpact: 'High - Cash flow impact',
        legalImpact: 'Low - Financial matter',
        estimatedTime: overdueInvoices.length * 15,
        confidenceScore: 95,
        actions: [
          { type: 'create_reminder', label: 'Send Reminders', requiresApproval: false },
          { type: 'schedule', label: 'Schedule Follow-up Calls', requiresApproval: true },
        ],
      });
    }

    // Revenue analysis
    recommendations.push({
      type: 'finance',
      priority: 'low',
      title: 'Analyze Revenue Trends',
      description: 'Review financial performance and trends',
      reason: 'Financial analysis helps business decisions',
      businessImpact: 'Medium - Informs business strategy',
      legalImpact: 'Low - Financial matter',
      estimatedTime: 20,
      confidenceScore: 80,
      actions: [
        { type: 'analyze', label: 'Generate Revenue Report', requiresApproval: false },
        { type: 'create_reminder', label: 'Schedule Review', requiresApproval: false },
      ],
    });

    return recommendations;
  }
}
