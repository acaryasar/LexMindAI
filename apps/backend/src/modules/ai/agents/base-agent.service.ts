import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../providers/provider-factory.service';
import { 
  IAIAgent, 
  AgentExecutionContext, 
  AgentExecutionResult 
} from './interfaces/agent.interface';

@Injectable()
export abstract class BaseAgent implements IAIAgent {
  protected readonly logger: Logger;
  protected aiProviderFactory: AIProviderFactory;

  constructor(
    protected configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
    agentName: string,
  ) {
    this.logger = new Logger(agentName);
    this.aiProviderFactory = aiProviderFactory;
  }

  abstract readonly agentType: string;
  abstract readonly purpose: string;
  abstract readonly responsibilities: string[];
  abstract readonly confidence: number;
  abstract readonly riskScore: number;

  async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`Executing ${this.agentType} agent`);

      // Validate input
      if (!this.validateInput(context.input)) {
        throw new Error('Invalid input for agent');
      }

      // Build prompt
      const fullPrompt = this.buildPrompt(context);

      // Get provider from context or use default
      const providerName = context.options?.provider || this.configService.get<string>('DEFAULT_AI_PROVIDER', 'ollama');

      // Call LLM through provider factory
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() + ' Her zaman Türkçe dilinde cevap vermelisin.' },
        { role: 'user' as const, content: fullPrompt },
      ];

      const response = await this.aiProviderFactory.chat(messages, {
        model: this.configService.get<string>('OLLAMA_MODEL') || 'mistral:latest',
        temperature: 0.7,
        maxTokens: 2000,
      }, providerName);

      const executionTime = Date.now() - startTime;

      // Parse response
      const result = this.parseResponse(response.content);

      return {
        data: result,
        confidence: this.confidence,
        reasons: result.reasons || [],
        sources: result.sources || [],
        recommendations: result.recommendations || [],
        warnings: result.warnings || [],
        actions: result.actions || [],
        tokensUsed: response.usage?.totalTokens || 0,
        model: response.model,
        provider: providerName,
      };
    } catch (error) {
      this.logger.error(`Error executing ${this.agentType} agent:`, error);
      throw error;
    }
  }

  validateInput(input: any): boolean {
    return input !== null && input !== undefined;
  }

  getCapabilities(): string[] {
    return this.responsibilities;
  }

  protected abstract getSystemPrompt(): string;
  protected abstract buildPrompt(context: AgentExecutionContext): string;
  protected abstract parseResponse(response: string): any;

  protected formatContext(context: any): string {
    return JSON.stringify(context, null, 2);
  }
}
