import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { format, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DailyPlannerService {
  constructor(private readonly prisma: PrismaService) {}

  async generateDailyPlan(userId: string, date?: Date) {
    const targetDate = date || new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Get user's data for the day
    const [hearings, tasks, events, cases] = await Promise.all([
      this.prisma.caseHearing.findMany({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
          case: {
            lawyers: {
              some: {
                userId,
              },
            },
          },
        },
        include: {
          case: true,
        },
      }),
      this.prisma.task.findMany({
        where: {
          dueDate: {
            gte: dayStart,
            lte: dayEnd,
          },
          deletedAt: null,
        },
      }),
      this.prisma.calendarEvent.findMany({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
          deletedAt: null,
        },
      }),
      this.prisma.case.findMany({
        where: {
          lawyers: {
            some: {
              userId,
            },
          },
          deletedAt: null,
        },
        include: {
          clients: true,
        },
      }),
    ]);

    // Calculate workload
    const totalTasks = tasks.length + hearings.length + events.length;
    const estimatedMinutes = this.calculateEstimatedTime(hearings, tasks, events);
    const estimatedHours = Math.round(estimatedMinutes / 60);

    // Generate greeting based on time
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    // Generate priorities
    const priorities = this.generatePriorities(hearings, tasks, events, cases);

    // Generate suggested work order
    const suggestedOrder = this.generateWorkOrder(hearings, tasks, events);

    // Calculate remaining free time (assuming 8-hour workday)
    const workDayMinutes = 8 * 60;
    const remainingFreeTime = Math.max(0, workDayMinutes - estimatedMinutes);

    // Create or update daily plan
    const dailyPlan = await this.prisma.aIDailyPlan.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      create: {
        userId,
        date: dayStart,
        greeting,
        workload: {
          totalTasks,
          hearings: hearings.length,
          tasks: tasks.length,
          events: events.length,
          estimatedMinutes,
          estimatedHours,
        },
        priorities,
        suggestedOrder,
        estimatedCompletion: estimatedMinutes,
        remainingFreeTime,
      },
      update: {
        greeting,
        workload: {
          totalTasks,
          hearings: hearings.length,
          tasks: tasks.length,
          events: events.length,
          estimatedMinutes,
          estimatedHours,
        },
        priorities,
        suggestedOrder,
        estimatedCompletion: estimatedMinutes,
        remainingFreeTime,
      },
    });

    return dailyPlan;
  }

  async getDailyPlan(userId: string, date?: Date) {
    const targetDate = date ? startOfDay(date) : startOfDay(new Date());

    let dailyPlan = await this.prisma.aIDailyPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    // If no plan exists, generate one
    if (!dailyPlan) {
      dailyPlan = await this.generateDailyPlan(userId, targetDate);
    }

    return dailyPlan;
  }

  async optimizeDay(userId: string) {
    const dailyPlan = await this.generateDailyPlan(userId);
    
    // This would integrate with AI to provide optimization suggestions
    // For now, return the generated plan
    return {
      plan: dailyPlan,
      suggestions: [
        'Start with high-priority hearings',
        'Block time for document review',
        'Schedule client calls in afternoon',
        'Reserve 30 minutes for unexpected tasks',
      ],
    };
  }

  private calculateEstimatedTime(hearings: any[], tasks: any[], events: any[]): number {
    let totalMinutes = 0;

    // Hearings: estimate 2 hours each
    totalMinutes += hearings.length * 120;

    // Tasks: estimate 30 minutes each
    totalMinutes += tasks.length * 30;

    // Events: use duration if available, otherwise 1 hour
    totalMinutes += events.reduce((sum, event) => {
      return sum + (event.duration || 60);
    }, 0);

    return totalMinutes;
  }

  private generatePriorities(hearings: any[], tasks: any[], events: any[], cases: any[]) {
    const priorities: any[] = [];

    // Add hearings as high priority
    hearings.forEach((hearing) => {
      priorities.push({
        type: 'hearing',
        priority: 'critical',
        title: `Hearing: ${hearing.case.title}`,
        description: `${hearing.location || 'Court'} at ${hearing.time || '09:00'}`,
        estimatedTime: 120,
        caseId: hearing.caseId,
      });
    });

    // Add high-priority tasks
    tasks
      .filter((task) => task.priority === 'high')
      .forEach((task) => {
        priorities.push({
          type: 'task',
          priority: 'high',
          title: task.title,
          description: task.description || '',
          estimatedTime: 30,
          taskId: task.id,
        });
      });

    // Add important events
    events
      .filter((event) => event.type === 'deadline' || event.type === 'meeting')
      .forEach((event) => {
        priorities.push({
          type: 'event',
          priority: event.type === 'deadline' ? 'high' : 'medium',
          title: event.title,
          description: event.notes || '',
          estimatedTime: event.duration || 60,
          eventId: event.id,
        });
      });

    // Add cases with upcoming deadlines
    cases.forEach((caseItem) => {
      if (caseItem.status === 'active') {
        priorities.push({
          type: 'case',
          priority: 'medium',
          title: `Case Review: ${caseItem.title}`,
          description: `Client: ${caseItem.clients.map((c: any) => `${c.firstName} ${c.lastName}`).join(', ')}`,
          estimatedTime: 45,
          caseId: caseItem.id,
        });
      }
    });

    // Sort by priority
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    priorities.sort((a, b) => (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999));

    return priorities.slice(0, 10); // Return top 10 priorities
  }

  private generateWorkOrder(hearings: any[], tasks: any[], events: any[]) {
    const order: any[] = [];

    // Morning: Hearings first
    hearings.forEach((hearing) => {
      order.push({
        time: hearing.time || '09:00',
        type: 'hearing',
        title: hearing.case.title,
        duration: 120,
      });
    });

    // Mid-morning: High-priority tasks
    tasks
      .filter((task) => task.priority === 'high')
      .slice(0, 3)
      .forEach((task, index) => {
        order.push({
          time: '11:00',
          type: 'task',
          title: task.title,
          duration: 30,
          sequence: index + 1,
        });
      });

    // Afternoon: Events and meetings
    events.forEach((event) => {
      order.push({
        time: '14:00',
        type: 'event',
        title: event.title,
        duration: event.duration || 60,
      });
    });

    // Late afternoon: Remaining tasks
    tasks
      .filter((task) => task.priority !== 'high')
      .slice(0, 3)
      .forEach((task, index) => {
        order.push({
          time: '16:00',
          type: 'task',
          title: task.title,
          duration: 30,
          sequence: index + 1,
        });
      });

    return order;
  }
}
