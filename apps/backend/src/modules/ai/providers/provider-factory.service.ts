import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, ChatMessage, ChatOptions, ChatResponse } from './ai-provider.interface';
import { OpenAIProvider } from './openai.provider';

@Injectable()
export class AIProviderFactory {
  private readonly logger = new Logger(AIProviderFactory.name);
  private providers = new Map<string, AIProvider>();
  private defaultProvider: string = 'openai';

  constructor(
    private configService: ConfigService,
    private openaiProvider: OpenAIProvider,
  ) {
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set('openai', this.openaiProvider);

    const defaultProviderName = this.configService.get<string>('DEFAULT_AI_PROVIDER', 'openai');
    if (this.providers.has(defaultProviderName)) {
      this.defaultProvider = defaultProviderName;
    }

    this.logger.log(`Registered ${this.providers.size} AI providers, default: ${this.defaultProvider}`);
  }

  getProvider(name?: string): AIProvider {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      this.logger.warn(`Provider ${providerName} not found, falling back to default`);
      return this.providers.get(this.defaultProvider) || this.openaiProvider;
    }

    if (!provider.isAvailable()) {
      this.logger.warn(`Provider ${providerName} is not available, falling back to default`);
      return this.providers.get(this.defaultProvider) || this.openaiProvider;
    }

    return provider;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions, providerName?: string): Promise<ChatResponse> {
    const provider = this.getProvider(providerName);
    return provider.chat(messages, options);
  }

  async *stream(messages: ChatMessage[], options?: ChatOptions, providerName?: string): AsyncIterable<any> {
    const provider = this.getProvider(providerName);
    yield* provider.stream(messages, options);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(key => this.providers.get(key)?.isAvailable());
  }

  setDefaultProvider(name: string): void {
    if (this.providers.has(name) && this.providers.get(name)?.isAvailable()) {
      this.defaultProvider = name;
      this.logger.log(`Default provider set to: ${name}`);
    }
  }
}
