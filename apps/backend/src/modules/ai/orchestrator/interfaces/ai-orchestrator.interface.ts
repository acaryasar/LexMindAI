import { Observable } from 'rxjs';

export interface AIOrchestrationRequest {
  userId: string;
  agentType: string;
  context?: any;
  input: any;
  options?: AIOrchestrationOptions;
}

export interface AIOrchestrationOptions {
  stream?: boolean;
  timeout?: number;
  maxRetries?: number;
  enableCache?: boolean;
  enableMemory?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface AIOrchestrationResponse {
  agentType: string;
  result: any;
  confidence: number;
  reasons: string[];
  sources: string[];
  recommendations: string[];
  warnings: string[];
  actions: AIAction[];
  metadata: AIOrchestrationMetadata;
}

export interface AIAction {
  type: string;
  label: string;
  description?: string;
  requiresApproval: boolean;
  outcome?: string;
}

export interface AIOrchestrationMetadata {
  executionTime: number;
  tokensUsed: number;
  agentsExecuted: string[];
  cacheHit: boolean;
  memoryUsed: boolean;
  model: string;
  provider: string;
}

export interface IAIOrchestrator {
  orchestrate(request: AIOrchestrationRequest): Promise<AIOrchestrationResponse>;
  orchestrateStream(request: AIOrchestrationRequest): Observable<AIOrchestrationResponse>;
  executeParallel(requests: AIOrchestrationRequest[]): Promise<AIOrchestrationResponse[]>;
  cancelExecution(executionId: string): Promise<void>;
  getExecutionStatus(executionId: string): Promise<any>;
}
