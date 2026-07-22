import { Test, TestingModule } from '@nestjs/testing';
import { AIContextBuilder } from './context-builder.service';
import { PrismaService } from '@database/prisma.service';

describe('AIContextBuilder', () => {
  let service: AIContextBuilder;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIContextBuilder,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
              }),
            },
            case: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
            },
            client: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
            },
            calendarEvent: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            task: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AIContextBuilder>(AIContextBuilder);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildContext', () => {
    it('should build context for user', async () => {
      const context = await service.buildContext('user123', {});

      expect(context).toBeDefined();
      expect(context.user).toBeDefined();
      expect(context.user.id).toBe('user123');
    });

    it('should include case data when caseId is provided', async () => {
      const mockCase = {
        id: 'case123',
        caseNumber: 'CASE-001',
        title: 'Test Case',
        status: 'ACTIVE',
      };

      jest.spyOn(prisma.case, 'findUnique').mockResolvedValue(mockCase as any);

      const context = await service.buildContext('user123', { caseId: 'case123' });

      expect(context.case).toBeDefined();
      expect(context.case.id).toBe('case123');
    });

    it('should include client data when clientId is provided', async () => {
      const mockClient = {
        id: 'client123',
        name: 'Test Client',
        email: 'client@example.com',
      };

      jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(mockClient as any);

      const context = await service.buildContext('user123', { clientId: 'client123' });

      expect(context.client).toBeDefined();
      expect(context.client.id).toBe('client123');
    });

    it('should include calendar events', async () => {
      const mockEvents = [
        { id: 'event1', title: 'Meeting', date: new Date() },
      ];

      jest.spyOn(prisma.calendarEvent, 'findMany').mockResolvedValue(mockEvents as any);

      const context = await service.buildContext('user123', {});

      expect(context.calendarEvents).toBeDefined();
      expect(Array.isArray(context.calendarEvents)).toBe(true);
    });

    it('should include tasks', async () => {
      const mockTasks = [
        { id: 'task1', title: 'Complete document', status: 'PENDING' },
      ];

      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(mockTasks as any);

      const context = await service.buildContext('user123', {});

      expect(context.tasks).toBeDefined();
      expect(Array.isArray(context.tasks)).toBe(true);
    });

    it('should handle missing user gracefully', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const context = await service.buildContext('user123', {});

      expect(context).toBeDefined();
    });
  });
});
