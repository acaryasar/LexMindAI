import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AIOrchestrator } from '../orchestrator/ai-orchestrator.service';

export interface WorkflowTrigger {
  type: 'case_created' | 'document_uploaded' | 'hearing_scheduled' | 'deadline_approaching' | 'manual';
  entityId?: string;
  entityType?: string;
  userId: string;
}

export interface WorkflowStep {
  id: string;
  type: 'ai_agent' | 'notification' | 'task' | 'document_generation' | 'condition';
  config: any;
  nextSteps?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: string;
  results: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);
  private workflows = new Map<string, any>();

  constructor(
    private prisma: PrismaService,
    private aiOrchestrator: AIOrchestrator,
  ) {
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows(): void {
    // Case creation workflow
    this.workflows.set('case_created', {
      id: 'case_created',
      name: 'Case Creation Workflow',
      trigger: 'case_created',
      steps: [
        {
          id: 'analyze_case',
          type: 'ai_agent',
          config: { agentType: 'case', action: 'analyze' },
          nextSteps: ['create_tasks'],
        },
        {
          id: 'create_tasks',
          type: 'task',
          config: { taskTemplate: 'case_initial_tasks' },
          nextSteps: ['send_notification'],
        },
        {
          id: 'send_notification',
          type: 'notification',
          config: { message: 'Case created and analyzed' },
        },
      ],
    });

    // Document upload workflow
    this.workflows.set('document_uploaded', {
      id: 'document_uploaded',
      name: 'Document Upload Workflow',
      trigger: 'document_uploaded',
      steps: [
        {
          id: 'analyze_document',
          type: 'ai_agent',
          config: { agentType: 'document', action: 'analyze' },
          nextSteps: ['extract_entities'],
        },
        {
          id: 'extract_entities',
          type: 'ai_agent',
          config: { agentType: 'document', action: 'extract_entities' },
          nextSteps: ['update_case'],
        },
        {
          id: 'update_case',
          type: 'condition',
          config: { condition: 'has_related_case' },
          nextSteps: ['notify_case_team'],
        },
      ],
    });

    // Hearing scheduled workflow
    this.workflows.set('hearing_scheduled', {
      id: 'hearing_scheduled',
      name: 'Hearing Scheduled Workflow',
      trigger: 'hearing_scheduled',
      steps: [
        {
          id: 'prepare_hearing',
          type: 'ai_agent',
          config: { agentType: 'hearing', action: 'prepare' },
          nextSteps: ['create_preparation_tasks'],
        },
        {
          id: 'create_preparation_tasks',
          type: 'task',
          config: { taskTemplate: 'hearing_preparation' },
          nextSteps: ['schedule_reminders'],
        },
        {
          id: 'schedule_reminders',
          type: 'notification',
          config: { reminderSchedule: ['1_week', '3_days', '1_day'] },
        },
      ],
    });

    this.logger.log(`Initialized ${this.workflows.size} default workflows`);
  }

  async triggerWorkflow(trigger: WorkflowTrigger): Promise<WorkflowExecution> {
    this.logger.log(`Triggering workflow: ${trigger.type}`);

    const workflow = this.workflows.get(trigger.type);
    if (!workflow) {
      throw new Error(`Workflow not found for trigger: ${trigger.type}`);
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: 'pending',
      currentStep: workflow.steps[0].id,
      results: {},
      startedAt: new Date(),
    };

    // Placeholder for database persistence
    // await this.prisma.aiWorkflowExecution.create({...});

    this.executeWorkflow(execution, workflow).catch((error) => {
      this.logger.error(`Workflow execution failed: ${execution.id}`, error);
      execution.status = 'failed';
    });

    return execution;
  }

  private async executeWorkflow(
    execution: WorkflowExecution,
    workflow: any,
  ): Promise<void> {
    execution.status = 'running';
    let currentStep = workflow.steps.find((s: any) => s.id === execution.currentStep);

    while (currentStep) {
      this.logger.log(`Executing step: ${currentStep.id}`);

      try {
        const result = await this.executeStep(currentStep);
        execution.results[currentStep.id] = result;

        const nextStepId = currentStep.nextSteps?.[0];
        if (nextStepId) {
          currentStep = workflow.steps.find((s: any) => s.id === nextStepId);
          execution.currentStep = nextStepId;
        } else {
          currentStep = null;
        }
      } catch (error) {
        this.logger.error(`Step execution failed: ${currentStep.id}`, error);
        execution.status = 'failed';
        return;
      }
    }

    execution.status = 'completed';
    execution.completedAt = new Date();

    // Placeholder for database persistence
    // await this.prisma.aiWorkflowExecution.update({...});

    this.logger.log(`Workflow execution completed: ${execution.id}`);
  }

  private async executeStep(step: WorkflowStep): Promise<any> {
    switch (step.type) {
      case 'ai_agent':
        return this.executeAIStep(step);
      case 'notification':
        return this.executeNotificationStep(step);
      case 'task':
        return this.executeTaskStep(step);
      case 'condition':
        return this.executeConditionStep(step);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeAIStep(step: WorkflowStep): Promise<any> {
    const { agentType, action } = step.config;
    return this.aiOrchestrator.orchestrate({
      agentType,
      userId: 'system',
      input: { action },
    });
  }

  private async executeNotificationStep(step: WorkflowStep): Promise<any> {
    const { message, reminderSchedule } = step.config;
    return { message, reminderSchedule, sent: true };
  }

  private async executeTaskStep(step: WorkflowStep): Promise<any> {
    const { taskTemplate } = step.config;
    return { taskTemplate, tasksCreated: true };
  }

  private async executeConditionStep(step: WorkflowStep): Promise<any> {
    const { condition } = step.config;
    return { condition, result: true };
  }

  getAvailableWorkflows(): any[] {
    return Array.from(this.workflows.values());
  }

  async getWorkflowExecutions(workflowId?: string): Promise<any[]> {
    // Placeholder for database query
    // const where = workflowId ? { workflowId } : {};
    // return this.prisma.aiWorkflowExecution.findMany({...});
    return [];
  }
}
