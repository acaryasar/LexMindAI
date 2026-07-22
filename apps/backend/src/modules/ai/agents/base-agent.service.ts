import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { 
  IAIAgent, 
  AgentExecutionContext, 
  AgentExecutionResult 
} from './interfaces/agent.interface';

@Injectable()
export abstract class BaseAgent implements IAIAgent {
  protected readonly logger: Logger;
  protected openai: OpenAI;

  constructor(
    protected configService: ConfigService,
    agentName: string,
  ) {
    this.logger = new Logger(agentName);
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
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

      // Call LLM
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0].message.content || '{}';
      const executionTime = Date.now() - startTime;

      // Parse response
      const result = this.parseResponse(responseText);

      return {
        data: result,
        confidence: this.confidence,
        reasons: result.reasons || [],
        sources: result.sources || [],
        recommendations: result.recommendations || [],
        warnings: result.warnings || [],
        actions: result.actions || [],
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model,
        provider: 'openai',
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
