export interface AIProvider {
  name: string;
  type: 'openai' | 'anthropic' | 'gemini' | 'azure-openai' | 'ollama' | 'openrouter';
  isAvailable(): boolean;
  chat(messages: any[], options?: any): Promise<any>;
  stream(messages: any[], options?: any): AsyncIterable<any>;
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  [key: string]: any;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}
