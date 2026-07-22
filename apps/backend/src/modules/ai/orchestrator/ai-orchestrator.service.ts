import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Observable, Subject, from, of } from 'rxjs';
import { map, switchMap, catchError, timeout } from 'rxjs/operators';
import { 
  IAIOrchestrator, 
  AIOrchestrationRequest, 
  AIOrchestrationResponse,
  AIOrchestrationOptions
} from './interfaces/ai-orchestrator.interface';
import { AIContextBuilder } from '../context-builder/context-builder.service';
import { AIMemoryService } from '../memory/memory.service';
import { PromptLibraryService } from '../prompt-library/prompt-library.service';
import { AIAgentFactory } from '../agents/agent-factory.service';
import { AICacheService } from '../cache/cache.service';
import { TelemetryService } from '../telemetry/telemetry.service';

@Injectable()
export class AIOrchestrator implements IAIOrchestrator {
  private readonly logger = new Logger(AIOrchestrator.name);
  private activeExecutions = new Map<string, any>();

  constructor(
    private contextBuilder: AIContextBuilder,
    private memoryService: AIMemoryService,
    private promptLibrary: PromptLibraryService,
    private agentFactory: AIAgentFactory,
    private cacheService: AICacheService,
    private telemetry: TelemetryService,
  ) {}

  async orchestrate(request: AIOrchestrationRequest): Promise<AIOrchestrationResponse> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    try {
      this.logger.log(`Starting orchestration for agent: ${request.agentType}, executionId: ${executionId}`);
      
      // Store execution
      this.activeExecutions.set(executionId, {
        status: 'running',
        startTime,
        request,
      });

      // Validate request
      await this.validateRequest(request);

      // Check cache if enabled
      if (request.options?.enableCache !== false) {
        const cached = await this.cacheService.get(request);
        if (cached) {
          this.logger.log(`Cache hit for execution: ${executionId}`);
          this.activeExecutions.delete(executionId);
          return {
            ...cached,
            metadata: {
              ...cached.metadata,
              cacheHit: true,
            },
          };
        }
      }

      // Build context
      const context = await this.contextBuilder.buildContext(request.userId, request.context);

      // Load memory if enabled
      let memory = null;
      if (request.options?.enableMemory !== false) {
        memory = await this.memoryService.getMemory(request.userId, request.agentType, context);
      }

      // Select and execute agent
      const agent = this.agentFactory.getAgent(request.agentType);
      if (!agent) {
        throw new NotFoundException(`Agent not found: ${request.agentType}`);
      }

      // Get prompt template
      const promptTemplate = await this.promptLibrary.getPrompt(request.agentType, request.input);

      // Execute agent
      const result = await agent.execute({
        input: request.input,
        context,
        memory,
        prompt: promptTemplate,
        options: request.options,
      });

      // Build response
      const response: AIOrchestrationResponse = {
        agentType: request.agentType,
        result: result.data,
        confidence: result.confidence || 0.8,
        reasons: result.reasons || [],
        sources: result.sources || [],
        recommendations: result.recommendations || [],
        warnings: result.warnings || [],
        actions: result.actions || [],
        metadata: {
          executionTime: Date.now() - startTime,
          tokensUsed: result.tokensUsed || 0,
          agentsExecuted: [request.agentType],
          cacheHit: false,
          memoryUsed: !!memory,
          model: result.model || 'gpt-4',
          provider: result.provider || 'openai',
        },
      };

      // Cache result
      if (request.options?.enableCache !== false) {
        await this.cacheService.set(request, response);
      }

      // Save memory if enabled
      if (request.options?.enableMemory !== false) {
        await this.memoryService.saveMemory(request.userId, request.agentType, context, result);
      }

      // Log telemetry
      await this.telemetry.logExecution({
        executionId,
        userId: request.userId,
        agentType: request.agentType,
        executionTime: response.metadata.executionTime,
        tokensUsed: response.metadata.tokensUsed,
        confidence: response.confidence,
        success: true,
      });

      // Clean up
      this.activeExecutions.delete(executionId);

      this.logger.log(`Orchestration completed for execution: ${executionId}`);
      return response;
    } catch (error) {
      this.logger.error(`Orchestration failed for execution: ${executionId}`, error);
      
      // Log telemetry for failure
      await this.telemetry.logExecution({
        executionId,
        userId: request.userId,
        agentType: request.agentType,
        executionTime: Date.now() - startTime,
        tokensUsed: 0,
        confidence: 0,
        success: false,
        error: error.message,
      });

      this.activeExecutions.delete(executionId);
      throw error;
    }
  }

  orchestrateStream(request: AIOrchestrationRequest): Observable<AIOrchestrationResponse> {
    const subject = new Subject<AIOrchestrationResponse>();
    const executionId = this.generateExecutionId();

    this.logger.log(`Starting stream orchestration for agent: ${request.agentType}, executionId: ${executionId}`);

    // Store execution
    this.activeExecutions.set(executionId, {
      status: 'running',
      startTime: Date.now(),
      request,
    });

    // Execute orchestration
    from(this.orchestrate(request))
      .pipe(
        timeout(request.options?.timeout || 30000),
        catchError((error) => {
          subject.error(error);
          this.activeExecutions.delete(executionId);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          subject.next(response);
          subject.complete();
          this.activeExecutions.delete(executionId);
        }
      });

    return subject.asObservable();
  }

  async executeParallel(requests: AIOrchestrationRequest[]): Promise<AIOrchestrationResponse[]> {
    this.logger.log(`Executing ${requests.length} parallel orchestrations`);

    const promises = requests.map((request) => this.orchestrate(request));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        this.logger.error(`Parallel execution failed for request ${index}`, result.reason);
        return {
          agentType: requests[index].agentType,
          result: null,
          confidence: 0,
          reasons: [],
          sources: [],
          recommendations: [],
          warnings: [`Execution failed: ${result.reason.message}`],
          actions: [],
          metadata: {
            executionTime: 0,
            tokensUsed: 0,
            agentsExecuted: [requests[index].agentType],
            cacheHit: false,
            memoryUsed: false,
            model: 'unknown',
            provider: 'unknown',
          },
        };
      }
    });
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution not found: ${executionId}`);
    }

    this.logger.log(`Cancelling execution: ${executionId}`);
    execution.status = 'cancelled';
    this.activeExecutions.delete(executionId);
  }

  async getExecutionStatus(executionId: string): Promise<any> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution not found: ${executionId}`);
    }

    return {
      executionId,
      status: execution.status,
      startTime: execution.startTime,
      elapsed: Date.now() - execution.startTime,
      request: {
        agentType: execution.request.agentType,
        userId: execution.request.userId,
      },
    };
  }

  private async validateRequest(request: AIOrchestrationRequest): Promise<void> {
    if (!request.userId) {
      throw new Error('userId is required');
    }
    if (!request.agentType) {
      throw new Error('agentType is required');
    }
    if (!request.input) {
      throw new Error('input is required');
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
