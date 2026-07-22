import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

export interface AIMemoryData {
  session?: any;
  conversation?: any;
  case?: any;
  client?: any;
  document?: any;
  recentActions?: any[];
  pinnedContext?: any;
}

@Injectable()
export class AIMemoryService {
  private readonly logger = new Logger(AIMemoryService.name);

  constructor(private prisma: PrismaService) {}

  async getMemory(userId: string, agentType: string, context?: any): Promise<AIMemoryData> {
    this.logger.log(`Getting memory for user: ${userId}, agent: ${agentType}`);

    const memory: AIMemoryData = {};

    // Get session memory
    memory.session = await this.getSessionMemory(userId);

    // Get conversation memory
    memory.conversation = await this.getConversationMemory(userId, context);

    // Get case memory
    if (context?.caseId) {
      memory.case = await this.getCaseMemory(context.caseId);
    }

    // Get client memory
    if (context?.clientId) {
      memory.client = await this.getClientMemory(context.clientId);
    }

    // Get document memory
    if (context?.documentIds) {
      memory.document = await this.getDocumentMemory(context.documentIds);
    }

    // Get recent actions
    memory.recentActions = await this.getRecentActionsMemory(userId);

    // Get pinned context
    memory.pinnedContext = await this.getPinnedContextMemory(userId);

    return memory;
  }

  async saveMemory(userId: string, agentType: string, context: any, result: any): Promise<void> {
    this.logger.log(`Saving memory for user: ${userId}, agent: ${agentType}`);

    // Save to AIMemory table
    try {
      const memoryKey = `${agentType}_${context?.caseId || 'global'}_${context?.clientId || 'global'}`;
      
      const existing = await this.prisma.aIMemory.findFirst({
        where: {
          userId,
          key: memoryKey,
        },
      });

      if (existing) {
        await this.prisma.aIMemory.update({
          where: { id: existing.id },
          data: {
            value: JSON.stringify({
              context,
              result,
              timestamp: new Date(),
            }),
          },
        });
      } else {
        await this.prisma.aIMemory.create({
          data: {
            userId,
            key: memoryKey,
            value: JSON.stringify({
              context,
              result,
              timestamp: new Date(),
            }),
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to save memory:', error);
    }
  }

  async clearMemory(userId: string, key?: string): Promise<void> {
    this.logger.log(`Clearing memory for user: ${userId}, key: ${key}`);

    if (key) {
      await this.prisma.aIMemory.deleteMany({
        where: {
          userId,
          key,
        },
      });
    } else {
      await this.prisma.aIMemory.deleteMany({
        where: {
          userId,
        },
      });
    }
  }

  async getMemoryExpiration(userId: string): Promise<void> {
    // Clean up old memory entries (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prisma.aIMemory.deleteMany({
      where: {
        userId,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    this.logger.log(`Cleaned up old memory for user: ${userId}`);
  }

  async compressMemory(userId: string): Promise<void> {
    // Compress old memory entries by summarizing
    this.logger.log(`Compressing memory for user: ${userId}`);
    // Implementation depends on specific compression strategy
  }

  private async getSessionMemory(userId: string) {
    // Get recent session data
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return sessions.map((s) => ({
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
    }));
  }

  private async getConversationMemory(userId: string, context?: any) {
    // Get recent conversations
    const conversations = await this.prisma.aIConversation.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      model: c.model,
      messageCount: c.messages.length,
      lastMessage: c.messages[0]?.content,
    }));
  }

  private async getCaseMemory(caseId: string) {
    // Get case-specific memory from AIMemory
    const memory = await this.prisma.aIMemory.findFirst({
      where: {
        key: {
          contains: caseId,
        },
      },
    });

    if (!memory) return null;

    try {
      return JSON.parse(memory.value);
    } catch {
      return null;
    }
  }

  private async getClientMemory(clientId: string) {
    // Get client-specific memory from AIMemory
    const memory = await this.prisma.aIMemory.findFirst({
      where: {
        key: {
          contains: clientId,
        },
      },
    });

    if (!memory) return null;

    try {
      return JSON.parse(memory.value);
    } catch {
      return null;
    }
  }

  private async getDocumentMemory(documentIds: string[]) {
    // Get document-specific memory from AIMemory
    const memories = await this.prisma.aIMemory.findMany({
      where: {
        key: {
          contains: documentIds[0],
        },
      },
    });

    return memories.map((m) => {
      try {
        return JSON.parse(m.value);
      } catch {
        return null;
      }
    });
  }

  private async getRecentActionsMemory(userId: string) {
    // Get recent actions from audit log
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return auditLogs.map((log) => ({
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      createdAt: log.createdAt,
    }));
  }

  private async getPinnedContextMemory(userId: string) {
    // Get pinned context from AIMemory
    const memory = await this.prisma.aIMemory.findFirst({
      where: {
        userId,
        key: 'pinned_context',
      },
    });

    if (!memory) return null;

    try {
      return JSON.parse(memory.value);
    } catch {
      return null;
    }
  }
}
