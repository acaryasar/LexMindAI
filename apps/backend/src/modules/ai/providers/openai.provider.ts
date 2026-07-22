import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { AIProvider, AIProviderConfig, ChatMessage, ChatOptions, ChatResponse } from './ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI';
  readonly type = 'openai' as const;
  private readonly logger = new Logger(OpenAIProvider.name);
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: options?.model || this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: false,
      });

      return {
        content: completion.choices[0].message.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        model: completion.model,
        finishReason: completion.choices[0].finish_reason,
      };
    } catch (error) {
      this.logger.error('OpenAI chat failed:', error);
      throw error;
    }
  }

  async *stream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<any> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options?.model || this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield { content, done: false };
        }
      }
      yield { content: '', done: true };
    } catch (error) {
      this.logger.error('OpenAI stream failed:', error);
      throw error;
    }
  }
}
