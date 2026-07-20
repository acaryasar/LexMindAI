import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';
import { UpdateRecommendationDto } from '../dto/update-recommendation.dto';
import { CreateWorkflowDto, CreateWorkflowStepDto } from '../dto/create-workflow.dto';
import { ExecuteWorkflowDto } from '../dto/execute-workflow.dto';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== RECOMMENDATIONS ====================

  async createRecommendation(userId: string, dto: CreateRecommendationDto) {
    const { actions, workflowId, ...recommendationData } = dto;

    const recommendation = await this.prisma.aIRecommendation.create({
      data: {
        ...recommendationData,
        userId,
        actions: actions
          ? {
              create: actions,
            }
          : undefined,
        workflow: workflowId
          ? {
              connect: { id: workflowId },
            }
          : undefined,
      },
      include: {
        actions: true,
        workflow: true,
      },
    });

    return recommendation;
  }

  async getRecommendations(userId: string, filters?: {
    type?: string;
    priority?: string;
    dismissed?: boolean;
    completed?: boolean;
    limit?: number;
  }) {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.dismissed !== undefined) {
      where.dismissedAt = filters.dismissed ? { not: null } : null;
    }

    if (filters?.completed !== undefined) {
      where.completedAt = filters.completed ? { not: null } : null;
    }

    const recommendations = await this.prisma.aIRecommendation.findMany({
      where,
      include: {
        actions: true,
        workflow: true,
      },
      orderBy: [
        { priority: 'desc' },
        { confidenceScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters?.limit || 50,
    });

    return recommendations;
  }

  async getTopPriorityRecommendation(userId: string) {
    const recommendation = await this.prisma.aIRecommendation.findFirst({
      where: {
        userId,
        dismissedAt: null,
        completedAt: null,
        deletedAt: null,
      },
      include: {
        actions: true,
        workflow: true,
      },
      orderBy: [
        { priority: 'desc' },
        { confidenceScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return recommendation;
  }

  async getRecommendationById(id: string, userId: string) {
    const recommendation = await this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        actions: true,
        workflow: true,
      },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    return recommendation;
  }

  async updateRecommendation(id: string, userId: string, dto: UpdateRecommendationDto) {
    const { actions, ...recommendationData } = dto;

    const recommendation = await this.prisma.aIRecommendation.update({
      where: {
        id,
        userId,
      },
      data: {
        ...recommendationData,
        actions: actions
          ? {
              deleteMany: {},
              create: actions,
            }
          : undefined,
      },
      include: {
        actions: true,
        workflow: true,
      },
    });

    return recommendation;
  }

  async dismissRecommendation(id: string, userId: string) {
    const recommendation = await this.prisma.aIRecommendation.update({
      where: {
        id,
        userId,
      },
      data: {
        dismissedAt: new Date(),
      },
    });

    return recommendation;
  }

  async completeRecommendation(id: string, userId: string) {
    const recommendation = await this.prisma.aIRecommendation.update({
      where: {
        id,
        userId,
      },
      data: {
        completedAt: new Date(),
      },
    });

    return recommendation;
  }

  async deleteRecommendation(id: string, userId: string) {
    await this.prisma.aIRecommendation.update({
      where: {
        id,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  // ==================== WORKFLOWS ====================

  async createWorkflow(dto: CreateWorkflowDto, createdBy: string) {
    const workflow = await this.prisma.aIWorkflow.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        steps: dto.steps as any,
        status: dto.status || 'active',
        createdBy,
      },
    });

    return workflow;
  }

  async getWorkflows() {
    return this.prisma.aIWorkflow.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        recommendations: true,
        executions: {
          orderBy: {
            startedAt: 'desc',
          },
          take: 5,
        },
      },
    });
  }

  async getWorkflowById(id: string) {
    const workflow = await this.prisma.aIWorkflow.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        recommendations: true,
        executions: {
          orderBy: {
            startedAt: 'desc',
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async executeWorkflow(userId: string, dto: ExecuteWorkflowDto) {
    const workflow = await this.prisma.aIWorkflow.findUnique({
      where: {
        id: dto.workflowId,
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const execution = await this.prisma.aIWorkflowExecution.create({
      data: {
        workflowId: dto.workflowId,
        userId,
        status: 'running',
        currentStep: 0,
        progress: 0,
        results: dto.context as any,
      },
    });

    // Start workflow execution in background
    this.executeWorkflowSteps(execution.id, workflow, dto.context).catch((error) => {
      console.error('Workflow execution error:', error);
    });

    return execution;
  }

  private async executeWorkflowSteps(executionId: string, workflow: any, context: any) {
    const steps = workflow.steps as CreateWorkflowStepDto[];
    const totalSteps = steps.length;
    const results: any[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      try {
        // Update execution status
        await this.prisma.aIWorkflowExecution.update({
          where: { id: executionId },
          data: {
            currentStep: i,
            progress: Math.round(((i + 1) / totalSteps) * 100),
          },
        });

        // Execute step based on type
        const stepResult = await this.executeStep(step, context);
        results.push({
          step: step.name,
          result: stepResult,
        });

        // Update context with step result
        context = {
          ...context,
          [step.name]: stepResult,
        };
      } catch (error) {
        await this.prisma.aIWorkflowExecution.update({
          where: { id: executionId },
          data: {
            status: 'failed',
            error: error.message,
          },
        });
        throw error;
      }
    }

    // Mark execution as complete
    await this.prisma.aIWorkflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        results: results as any,
      },
    });
  }

  private async executeStep(step: CreateWorkflowStepDto, context: any): Promise<any> {
    // This is a placeholder for actual step execution logic
    // In a real implementation, this would call appropriate services based on step type
    switch (step.type) {
      case 'summarize':
        return { summary: 'AI-generated summary' };
      case 'search':
        return { results: [] };
      case 'generate':
        return { content: 'Generated content' };
      case 'analyze':
        return { analysis: 'Analysis result' };
      case 'create_reminder':
        return { reminderId: '123' };
      case 'schedule':
        return { eventId: '456' };
      case 'assign_task':
        return { taskId: '789' };
      default:
        return { executed: true };
    }
  }

  async getWorkflowExecution(executionId: string, userId: string) {
    const execution = await this.prisma.aIWorkflowExecution.findFirst({
      where: {
        id: executionId,
        userId,
      },
      include: {
        workflow: true,
      },
    });

    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }

    return execution;
  }

  async pauseWorkflowExecution(executionId: string, userId: string) {
    const execution = await this.prisma.aIWorkflowExecution.updateMany({
      where: {
        id: executionId,
        userId,
      },
      data: {
        status: 'paused',
      },
    });

    if (execution.count === 0) {
      throw new NotFoundException('Workflow execution not found');
    }

    return { success: true };
  }

  async resumeWorkflowExecution(executionId: string, userId: string) {
    const execution = await this.prisma.aIWorkflowExecution.updateMany({
      where: {
        id: executionId,
        userId,
      },
      data: {
        status: 'running',
      },
    });

    if (execution.count === 0) {
      throw new NotFoundException('Workflow execution not found');
    }

    return { success: true };
  }

  async cancelWorkflowExecution(executionId: string, userId: string) {
    const execution = await this.prisma.aIWorkflowExecution.updateMany({
      where: {
        id: executionId,
        userId,
      },
      data: {
        status: 'cancelled',
      },
    });

    if (execution.count === 0) {
      throw new NotFoundException('Workflow execution not found');
    }

    return { success: true };
  }
}
