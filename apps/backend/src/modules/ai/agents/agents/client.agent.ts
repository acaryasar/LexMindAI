import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class ClientAgent extends BaseAgent {
  readonly agentType = 'client';
  readonly purpose = 'Analyze client relationships and provide insights';
  readonly responsibilities = [
    'Summarize relationship history',
    'Identify pending matters',
    'Provide communication recommendations',
    'Assess relationship risks',
    'Suggest action items',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.2;

  constructor(configService: ConfigService) {
    super(configService, 'ClientAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Client Agent for LexMind AI, a legal practice management system.
    Your task is to analyze client relationships and provide insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the following client: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "relationshipSummary": "Summary of client relationship",
  "pendingMatters": [
    { "matter": "Matter description", "urgency": "high|medium|low", "deadline": "ISO date" }
  ],
  "communicationRecommendations": [
    { "type": "email|phone|meeting", "topic": "Topic", "timing": "immediate|this_week|this_month" }
  ],
  "riskAssessment": {
    "overallRisk": "low|medium|high",
    "factors": ["Factor 1", "Factor 2"]
  },
  "actionItems": [
    { "action": "Action description", "priority": "high|medium|low", "dueDate": "ISO date" }
  ],
  "reasons": ["Reason 1", "Reason 2"],
  "sources": ["Source 1", "Source 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "actions": [
    { "type": "action_type", "label": "Action label", "description": "Action description", "requiresApproval": false }
  ]
}`;
  }

  protected parseResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to parse JSON response:', error);
      return {
        relationshipSummary: 'Unable to parse AI response',
        pendingMatters: [],
        communicationRecommendations: [],
        riskAssessment: { overallRisk: 'unknown', factors: [] },
        actionItems: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.clientId || input.clientEmail);
  }
}
