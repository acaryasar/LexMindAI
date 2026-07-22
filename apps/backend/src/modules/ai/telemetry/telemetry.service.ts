import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

export interface TelemetryLog {
  executionId: string;
  userId: string;
  agentType: string;
  executionTime: number;
  tokensUsed: number;
  confidence: number;
  success: boolean;
  error?: string;
  metadata?: any;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private prisma: PrismaService) {}

  async logExecution(log: TelemetryLog): Promise<void> {
    try {
      // Log to AI Usage Log
      await this.prisma.aIUsageLog.create({
        data: {
          userId: log.userId,
          model: 'unknown',
          inputTokens: Math.floor(log.tokensUsed * 0.4),
          outputTokens: Math.floor(log.tokensUsed * 0.6),
          totalTokens: log.tokensUsed,
          responseTime: log.executionTime,
          error: log.error,
        },
      });

      // Log to Audit Log
      await this.prisma.auditLog.create({
        data: {
          userId: log.userId,
          action: `AI_EXECUTION_${log.agentType}`,
          entity: 'AIOrchestration',
          entityId: log.executionId,
          details: JSON.stringify({
            agentType: log.agentType,
            executionTime: log.executionTime,
            tokensUsed: log.tokensUsed,
            confidence: log.confidence,
            success: log.success,
            metadata: log.metadata,
          }),
        },
      });

      this.logger.log(`Telemetry logged for execution: ${log.executionId}`);
    } catch (error) {
      this.logger.error('Failed to log telemetry:', error);
    }
  }

  async getExecutionStats(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const usageLogs = await this.prisma.aIUsageLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalExecutions = usageLogs.length;
    const totalTokens = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0);
    const avgResponseTime = usageLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalExecutions || 0;
    const errorCount = usageLogs.filter((log) => log.error).length;

    return {
      totalExecutions,
      totalTokens,
      avgResponseTime,
      errorCount,
      successRate: totalExecutions > 0 ? ((totalExecutions - errorCount) / totalExecutions) * 100 : 0,
    };
  }

  async getAgentStats(agentType: string, startDate?: Date, endDate?: Date): Promise<any> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        action: `AI_EXECUTION_${agentType}`,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        } : {}),
      },
    });

    const totalExecutions = auditLogs.length;
    const successfulExecutions = auditLogs.filter((log) => {
      const details = JSON.parse(log.details || '{}');
      return details.success;
    }).length;

    return {
      agentType,
      totalExecutions,
      successfulExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
    };
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<any[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: {
          startsWith: 'AI_EXECUTION_',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return auditLogs.map((log) => ({
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      createdAt: log.createdAt,
      details: JSON.parse(log.details || '{}'),
    }));
  }
}
