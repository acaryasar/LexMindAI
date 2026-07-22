export interface AgentExecutionContext {
  input: any;
  context: any;
  memory?: any;
  prompt: string;
  options?: any;
}

export interface AgentExecutionResult {
  data: any;
  confidence: number;
  reasons: string[];
  sources: string[];
  recommendations: string[];
  warnings: string[];
  actions: any[];
  tokensUsed?: number;
  model?: string;
  provider?: string;
}

export interface IAIAgent {
  readonly agentType: string;
  readonly purpose: string;
  readonly responsibilities: string[];
  readonly confidence: number;
  readonly riskScore: number;
  
  execute(context: AgentExecutionContext): Promise<AgentExecutionResult>;
  validateInput(input: any): boolean;
  getCapabilities(): string[];
}
