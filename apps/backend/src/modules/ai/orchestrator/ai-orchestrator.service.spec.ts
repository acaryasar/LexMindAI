import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AIOrchestrator } from './ai-orchestrator.service';
import { AIContextBuilder } from '../context-builder/context-builder.service';
import { AIMemoryService } from '../memory/memory.service';
import { PromptLibraryService } from '../prompt-library/prompt-library.service';
import { AIAgentFactory } from '../agents/agent-factory.service';
import { AICacheService } from '../cache/cache.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { IAIAgent } from '../agents/interfaces/agent.interface';

describe('AIOrchestrator', () => {
  let orchestrator: AIOrchestrator;
  let contextBuilder: AIContextBuilder;
  let memoryService: AIMemoryService;
  let promptLibrary: PromptLibraryService;
  let agentFactory: AIAgentFactory;
  let cacheService: AICacheService;
  let telemetry: TelemetryService;

  const mockAgent: IAIAgent = {
    agentType: 'dashboard',
    purpose: 'Test agent',
    responsibilities: ['Test'],
    confidence: 0.9,
    riskScore: 0.1,
    execute: async () => ({
      data: 'result',
      confidence: 0.9,
      reasons: [],
      sources: [],
      recommendations: [],
      warnings: [],
      actions: [],
    }),
    validateInput: () => true,
    getCapabilities: () => ['test'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIOrchestrator,
        {
          provide: AIContextBuilder,
          useValue: {
            buildContext: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: AIMemoryService,
          useValue: {
            getMemory: jest.fn().mockResolvedValue(null),
            saveMemory: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PromptLibraryService,
          useValue: {
            getPrompt: jest.fn().mockResolvedValue('Prompt template'),
          },
        },
        {
          provide: AIAgentFactory,
          useValue: {
            getAgent: jest.fn().mockReturnValue(mockAgent),
          },
        },
        {
          provide: AICacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: TelemetryService,
          useValue: {
            logExecution: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    orchestrator = module.get<AIOrchestrator>(AIOrchestrator);
    contextBuilder = module.get<AIContextBuilder>(AIContextBuilder);
    memoryService = module.get<AIMemoryService>(AIMemoryService);
    promptLibrary = module.get<PromptLibraryService>(PromptLibraryService);
    agentFactory = module.get<AIAgentFactory>(AIAgentFactory);
    cacheService = module.get<AICacheService>(AICacheService);
    telemetry = module.get<TelemetryService>(TelemetryService);
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  describe('orchestrate', () => {
    it('should successfully orchestrate a request', async () => {
      const request = {
        userId: 'user123',
        agentType: 'dashboard',
        input: { action: 'test' },
      };

      const response = await orchestrator.orchestrate(request);

      expect(response).toBeDefined();
      expect(response.agentType).toBe('dashboard');
      expect(response.result).toBeDefined();
      expect(contextBuilder.buildContext).toHaveBeenCalled();
      expect(agentFactory.getAgent).toHaveBeenCalledWith('dashboard');
    });

    it('should throw error if agent not found', async () => {
      jest.spyOn(agentFactory, 'getAgent').mockReturnValue(undefined);

      const request = {
        userId: 'user123',
        agentType: 'nonexistent',
        input: {},
      };

      await expect(orchestrator.orchestrate(request)).rejects.toThrow(NotFoundException);
    });

    it('should use cached result if available', async () => {
      const cachedResponse = {
        agentType: 'dashboard',
        result: 'cached result',
        confidence: 0.9,
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: [],
        actions: [],
        metadata: {
          executionTime: 100,
          tokensUsed: 50,
          agentsExecuted: ['dashboard'],
          cacheHit: false,
          memoryUsed: false,
          model: 'gpt-4',
          provider: 'openai',
        },
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedResponse);

      const request = {
        userId: 'user123',
        agentType: 'dashboard',
        input: {},
      };

      const response = await orchestrator.orchestrate(request);

      expect(response.metadata.cacheHit).toBe(true);
      expect(response.result).toBe('cached result');
    });

    it('should validate request and throw error if userId is missing', async () => {
      const request = {
        agentType: 'dashboard',
        input: {},
      } as any;

      await expect(orchestrator.orchestrate(request)).rejects.toThrow('userId is required');
    });

    it('should validate request and throw error if agentType is missing', async () => {
      const request = {
        userId: 'user123',
        input: {},
      } as any;

      await expect(orchestrator.orchestrate(request)).rejects.toThrow('agentType is required');
    });

    it('should validate request and throw error if input is missing', async () => {
      const request = {
        userId: 'user123',
        agentType: 'dashboard',
      } as any;

      await expect(orchestrator.orchestrate(request)).rejects.toThrow('input is required');
    });
  });

  describe('executeParallel', () => {
    it('should execute multiple orchestrations in parallel', async () => {
      const requests = [
        { userId: 'user123', agentType: 'dashboard', input: { action: 'test1' } },
        { userId: 'user123', agentType: 'case', input: { action: 'test2' } },
      ];

      const responses = await orchestrator.executeParallel(requests);

      expect(responses).toHaveLength(2);
      expect(responses[0].agentType).toBe('dashboard');
      expect(responses[1].agentType).toBe('case');
    });

    it('should handle partial failures in parallel execution', async () => {
      jest.spyOn(agentFactory, 'getAgent').mockReturnValueOnce(mockAgent).mockReturnValueOnce(undefined);

      const requests = [
        { userId: 'user123', agentType: 'dashboard', input: {} },
        { userId: 'user123', agentType: 'nonexistent', input: {} },
      ];

      const responses = await orchestrator.executeParallel(requests);

      expect(responses).toHaveLength(2);
      expect(responses[0].agentType).toBe('dashboard');
      expect(responses[1].warnings).toContain('Execution failed');
    });
  });

  describe('cancelExecution', () => {
    it('should cancel an active execution', async () => {
      const executionId = 'exec_test_123';

      await expect(orchestrator.cancelExecution(executionId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getExecutionStatus', () => {
    it('should return execution status', async () => {
      const executionId = 'exec_test_123';

      await expect(orchestrator.getExecutionStatus(executionId)).rejects.toThrow(NotFoundException);
    });
  });
});
