import api from '../api';

export interface AIOrchestrationRequest {
  agentType: string;
  userId: string;
  input: any;
  context?: any;
  options?: {
    enableCache?: boolean;
    enableMemory?: boolean;
    timeout?: number;
  };
}

export interface AIOrchestrationResponse {
  agentType: string;
  result: any;
  confidence: number;
  reasons: string[];
  sources: string[];
  recommendations: string[];
  warnings: string[];
  actions: any[];
  metadata: {
    executionTime: number;
    tokensUsed: number;
    agentsExecuted: string[];
    cacheHit: boolean;
    memoryUsed: boolean;
    model: string;
    provider: string;
  };
}

export interface AISkillRequest {
  skill: 'summarize' | 'analyzeRisk' | 'detectDeadlines' | 'extractEntities' | 'translate' | 'improveWriting';
  text: string;
  options?: any;
}

export interface AISkillResponse {
  success: boolean;
  result?: any;
  error?: string;
  tokensUsed?: number;
}

export const aiApi = {
  // Orchestration
  orchestrate: async (request: AIOrchestrationRequest): Promise<AIOrchestrationResponse> => {
    const response = await api.post<AIOrchestrationResponse>('/ai/orchestrate', request);
    return response.data;
  },

  orchestrateStream: async (request: AIOrchestrationRequest) => {
    // Streaming implementation would go here
    return api.post('/ai/orchestrate/stream', request);
  },

  // Skills
  summarize: async (text: string, options?: any): Promise<AISkillResponse> => {
    const response = await api.post<AISkillResponse>('/ai/skills/summarize', { text, options });
    return response.data;
  },

  analyzeRisk: async (text: string, options?: any): Promise<AISkillResponse> => {
    const response = await api.post<AISkillResponse>('/ai/skills/analyze-risk', { text, options });
    return response.data;
  },

  detectDeadlines: async (text: string, options?: any): Promise<AISkillResponse> => {
    const response = await api.post<AISkillResponse>('/ai/skills/detect-deadlines', { text, options });
    return response.data;
  },

  extractEntities: async (text: string, options?: any): Promise<AISkillResponse> => {
    const response = await api.post<AISkillResponse>('/ai/skills/extract-entities', { text, options });
    return response.data;
  },

  translate: async (text: string, targetLanguage: string, options?: any): Promise<AISkillResponse> => {
    const response = await api.post<AISkillResponse>('/ai/skills/translate', { text, targetLanguage, options });
    return response.data;
  },

  improveWriting: async (text: string, options?: any): Promise<AISkillResponse> => {
    const response = await api.post<AISkillResponse>('/ai/skills/improve-writing', { text, options });
    return response.data;
  },

  // Tools
  searchCases: async (query: string, filters?: any) => {
    const response = await api.post('/ai/tools/search-cases', { query, filters });
    return response.data;
  },

  searchDocuments: async (query: string, filters?: any) => {
    const response = await api.post('/ai/tools/search-documents', { query, filters });
    return response.data;
  },

  performOCR: async (imageData: string) => {
    const response = await api.post('/ai/tools/ocr', { imageData });
    return response.data;
  },

  speechToText: async (audioData: string) => {
    const response = await api.post('/ai/tools/speech-to-text', { audioData });
    return response.data;
  },

  textToSpeech: async (text: string, voice?: string) => {
    const response = await api.post('/ai/tools/text-to-speech', { text, voice });
    return response.data;
  },

  // Workflow
  triggerWorkflow: async (trigger: any) => {
    const response = await api.post('/ai/workflow/trigger', trigger);
    return response.data;
  },

  getWorkflows: async () => {
    const response = await api.get('/ai/workflow');
    return response.data;
  },

  getWorkflowExecutions: async (workflowId?: string) => {
    const response = await api.get('/ai/workflow/executions', { params: { workflowId } });
    return response.data;
  },

  // Chat
  chat: async (message: string, conversationId?: string, context?: any) => {
    const response = await api.post('/ai/chat', { message, conversationId, context });
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await api.get(`/ai/conversations/${conversationId}`);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/ai/conversations');
    return response.data;
  },

  // Memory
  getMemory: async (userId: string, agentType?: string) => {
    const response = await api.get('/ai/memory', { params: { userId, agentType } });
    return response.data;
  },

  saveMemory: async (userId: string, agentType: string, context: any, result: any) => {
    const response = await api.post('/ai/memory', { userId, agentType, context, result });
    return response.data;
  },

  // Telemetry
  getUsage: async (userId?: string, startDate?: Date, endDate?: Date) => {
    const response = await api.get('/ai/telemetry/usage', { params: { userId, startDate, endDate } });
    return response.data;
  },

  getExecutions: async (userId?: string, limit?: number) => {
    const response = await api.get('/ai/telemetry/executions', { params: { userId, limit } });
    return response.data;
  },
};
