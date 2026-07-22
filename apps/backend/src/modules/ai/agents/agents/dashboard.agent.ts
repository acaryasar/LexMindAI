import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class DashboardAgent extends BaseAgent {
  readonly agentType = 'dashboard';
  readonly purpose = 'Generate daily briefing and insights for lawyers';
  readonly responsibilities = [
    'Generate morning briefing',
    'Generate daily summary',
    'Generate priority list',
    'Generate risk analysis',
    'Generate time-saving suggestions',
    'Generate AI insights',
    'Generate notifications',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'DashboardAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Dashboard Agent for LexMind AI, a legal practice management system. 
    Your task is to provide comprehensive daily briefings and insights for lawyers.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Generate a daily briefing based on the following context: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "morningBriefing": "Summary of the day",
  "dailySummary": "Summary of activities",
  "priorityList": [
    { "task": "Task description", "urgency": "high|medium|low", "deadline": "ISO date" }
  ],
  "riskAnalysis": [
    { "risk": "Risk description", "impact": "high|medium|low", "mitigation": "Mitigation strategy" }
  ],
  "timeSavingSuggestions": ["Suggestion 1", "Suggestion 2"],
  "aiInsights": ["Insight 1", "Insight 2"],
  "notifications": [
    { "type": "deadline|hearing|task", "message": "Notification message", "action": "Suggested action" }
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
        morningBriefing: 'Unable to parse AI response',
        dailySummary: 'Unable to parse AI response',
        priorityList: [],
        riskAnalysis: [],
        timeSavingSuggestions: [],
        aiInsights: [],
        notifications: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input);
  }
}
