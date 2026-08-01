import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIProviderConfig, ChatMessage, ChatOptions, ChatResponse } from './ai-provider.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class OllamaProvider implements AIProvider {
  name = 'ollama';
  type = 'ollama' as const;
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly client: AxiosInstance;
  private readonly config: AIProviderConfig;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.defaultModel = this.configService.get<string>('OLLAMA_MODEL', 'llama3.2');
    
    this.config = {
      apiKey: '', // Ollama doesn't require API key
      model: this.defaultModel,
      baseUrl: this.baseUrl,
      temperature: 0.7,
      maxTokens: 2048,
    };

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 120000, // 2 minutes timeout for Ollama
    });

    this.logger.log(`Ollama provider initialized with base URL: ${this.baseUrl}, model: ${this.defaultModel}`);
  }

  isAvailable(): boolean {
    try {
      return !!this.baseUrl && !!this.defaultModel;
    } catch (error) {
      this.logger.error('Ollama provider availability check failed', error);
      return false;
    }
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const model = options?.model || this.config.model || this.defaultModel;
    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;

    try {
      this.logger.log(`Sending chat request to Ollama, model: ${model}, messages: ${messages.length}`);

      const response = await this.client.post('/api/chat', {
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        options: {
          temperature,
          num_predict: maxTokens,
        },
        stream: false,
      });

      const data = response.data;
      
      return {
        content: data.message?.content || data.response || '',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        model,
        finishReason: data.done ? 'stop' : 'length',
      };
    } catch (error) {
      this.logger.error('Ollama chat request failed', error);
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }

  async *stream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<any> {
    const model = options?.model || this.config.model || this.defaultModel;
    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;

    try {
      this.logger.log(`Starting stream request to Ollama, model: ${model}`);

      const response = await this.client.post('/api/chat', {
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        options: {
          temperature,
          num_predict: maxTokens,
        },
        stream: true,
      }, {
        responseType: 'stream',
      });

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield {
                content: data.message.content,
                done: data.done,
                model,
              };
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    } catch (error) {
      this.logger.error('Ollama stream request failed', error);
      throw new Error(`Ollama stream failed: ${error.message}`);
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      this.logger.error('Failed to list Ollama models', error);
      return [];
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      this.logger.log(`Pulling model: ${model}`);
      await this.client.post('/api/pull', { name: model });
      this.logger.log(`Model ${model} pulled successfully`);
    } catch (error) {
      this.logger.error(`Failed to pull model ${model}`, error);
      throw new Error(`Failed to pull model ${model}: ${error.message}`);
    }
  }
}
