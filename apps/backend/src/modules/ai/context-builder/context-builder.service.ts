import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

export interface AIContext {
  user?: any;
  case?: any;
  client?: any;
  document?: any;
  calendar?: any;
  tasks?: any;
  finance?: any;
  recentActions?: any[];
  pinnedContext?: any;
  summary?: string;
  [key: string]: any;
}

@Injectable()
export class AIContextBuilder {
  private readonly logger = new Logger(AIContextBuilder.name);

  constructor(private prisma: PrismaService) {}

  async buildContext(userId: string, additionalContext?: any): Promise<AIContext> {
    this.logger.log(`Building context for user: ${userId}`);

    const context: AIContext = {};

    // Collect user data
    context.user = await this.collectUserData(userId);

    // Collect case data if caseId provided
    if (additionalContext?.caseId) {
      context.case = await this.collectCaseData(additionalContext.caseId);
    }

    // Collect client data if clientId provided
    if (additionalContext?.clientId) {
      context.client = await this.collectClientData(additionalContext.clientId);
    }

    // Collect document data if documentIds provided
    if (additionalContext?.documentIds && additionalContext.documentIds.length > 0) {
      context.document = await this.collectDocumentData(additionalContext.documentIds);
    }

    // Collect calendar data
    context.calendar = await this.collectCalendarData(userId);

    // Collect tasks data
    context.tasks = await this.collectTasksData(userId);

    // Collect finance data
    context.finance = await this.collectFinanceData(userId);

    // Collect recent actions
    context.recentActions = await this.collectRecentActions(userId);

    // Normalize and optimize
    this.normalizeContext(context);
    await this.optimizeTokens(context);

    // Generate summary
    context.summary = this.generateSummary(context);

    return context;
  }

  private async collectUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      roles: user.roles.map((r) => r.role.name),
    };
  }

  private async collectCaseData(caseId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) return null;

    return {
      id: caseData.id,
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      type: caseData.type,
      status: caseData.status,
      courtName: caseData.courtName,
      courtCity: caseData.courtCity,
      startDate: caseData.startDate,
      endDate: caseData.endDate,
    };
  }

  private async collectClientData(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) return null;

    return {
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      phoneNumber: client.phoneNumber,
      nationalId: client.nationalId,
      taxNumber: client.taxNumber,
      tags: client.tags,
    };
  }

  private async collectDocumentData(documentIds: string[]) {
    const documents = await this.prisma.document.findMany({
      where: {
        id: {
          in: documentIds,
        },
      },
      select: {
        id: true,
        name: true,
        fileName: true,
        mimeType: true,
        size: true,
        category: true,
        createdAt: true,
      },
    });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      size: doc.size,
      category: doc.category,
      createdAt: doc.createdAt,
    }));
  }

  private async collectCalendarData(userId: string) {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: today,
          lte: thirtyDaysLater,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 20,
    });

    return {
      upcomingEvents: events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        duration: e.duration,
        location: e.location,
        type: e.type,
      })),
      totalCount: events.length,
    };
  }

  private async collectTasksData(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
      take: 20,
    });

    return {
      pendingTasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
      })),
      totalCount: tasks.length,
    };
  }

  private async collectFinanceData(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: {
          in: ['PENDING', 'OVERDUE'],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 10,
    });

    const totalPending = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return {
      pendingInvoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        dueDate: inv.dueDate,
        status: inv.status,
      })),
      totalPendingAmount: totalPending,
      pendingCount: invoices.length,
    };
  }

  private async collectRecentActions(userId: string) {
    // Collect recent actions from audit log
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return auditLogs.map((log) => ({
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      createdAt: log.createdAt,
    }));
  }

  private normalizeContext(context: AIContext): void {
    // Remove null values
    Object.keys(context).forEach((key) => {
      if (context[key] === null || context[key] === undefined) {
        delete context[key];
      }
    });

    // Remove duplicates
    // (implementation depends on specific use case)
  }

  private async optimizeTokens(context: AIContext): Promise<void> {
    // Chunk large documents
    if (context.document && Array.isArray(context.document)) {
      context.document = context.document.slice(0, 5); // Limit to 5 documents
    }

    // Summarize long history
    if (context.recentActions && context.recentActions.length > 10) {
      context.recentActions = context.recentActions.slice(0, 10);
    }

    // Limit calendar events
    if (context.calendar?.upcomingEvents && context.calendar.upcomingEvents.length > 10) {
      context.calendar.upcomingEvents = context.calendar.upcomingEvents.slice(0, 10);
    }

    // Limit tasks
    if (context.tasks?.pendingTasks && context.tasks.pendingTasks.length > 15) {
      context.tasks.pendingTasks = context.tasks.pendingTasks.slice(0, 15);
    }
  }

  private generateSummary(context: AIContext): string {
    const summaryParts: string[] = [];

    if (context.user) {
      summaryParts.push(`User: ${context.user.name}`);
    }

    if (context.case) {
      summaryParts.push(`Case: ${context.case.title} (${context.case.status})`);
    }

    if (context.client) {
      summaryParts.push(`Client: ${context.client.name}`);
    }

    if (context.calendar?.upcomingEvents) {
      summaryParts.push(`Upcoming events: ${context.calendar.upcomingEvents.length}`);
    }

    if (context.tasks?.pendingTasks) {
      summaryParts.push(`Pending tasks: ${context.tasks.pendingTasks.length}`);
    }

    if (context.finance?.pendingInvoices) {
      summaryParts.push(`Pending invoices: ${context.finance.pendingInvoices.length}`);
    }

    return summaryParts.join(', ');
  }
}
