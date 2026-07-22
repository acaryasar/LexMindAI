import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AISkillsService } from './skills.service';

describe('AISkillsService', () => {
  let service: AISkillsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AISkillsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'OPENAI_API_KEY') return 'test-api-key';
              if (key === 'OPENAI_MODEL') return 'gpt-4';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AISkillsService>(AISkillsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('summarizeText', () => {
    it('should summarize text successfully', async () => {
      const text = 'This is a long text that needs to be summarized.';
      const result = await service.summarizeText(text);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle empty text', async () => {
      const result = await service.summarizeText('');

      expect(result).toBeDefined();
    });
  });

  describe('analyzeRisk', () => {
    it('should analyze risk successfully', async () => {
      const text = 'This document contains potential legal risks.';
      const result = await service.analyzeRisk(text);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('detectDeadlines', () => {
    it('should detect deadlines successfully', async () => {
      const text = 'The deadline is December 31, 2026.';
      const result = await service.detectDeadlines(text);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('extractEntities', () => {
    it('should extract entities successfully', async () => {
      const text = 'John Smith from ABC Company signed the contract on January 1, 2026.';
      const result = await service.extractEntities(text);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('translateText', () => {
    it('should translate text successfully', async () => {
      const text = 'Hello world';
      const targetLanguage = 'Spanish';
      const result = await service.translateText(text, targetLanguage);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('improveLegalWriting', () => {
    it('should improve legal writing successfully', async () => {
      const text = 'The contract was signed by the party.';
      const result = await service.improveLegalWriting(text);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
