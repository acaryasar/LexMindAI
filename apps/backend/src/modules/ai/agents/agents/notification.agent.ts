import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class NotificationAgent extends BaseAgent {
  readonly agentType = 'notification';
  readonly purpose = 'Generate and manage notifications';
  readonly responsibilities = [
    'Generate notifications',
    'Prioritize alerts',
    'Schedule reminders',
    'Filter noise',
    'Optimize delivery',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'NotificationAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Notification Agent for LexMind AI, a legal practice management system.
    Your task is to generate and manage notifications.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Generate notifications: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "notifications": [
    {
      "type": "deadline|hearing|task|document|system",
      "title": "Notification title",
      "message": "Notification message",
      "priority": "high|medium|low",
      "urgency": "immediate|today|this_week",
      "action": "Suggested action",
      "requiresAction": true
    }
  ],
  "summary": "Summary of notifications",
  "totalHighPriority": 0,
  "totalMediumPriority": 0,
  "totalLowPriority": 0,
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
        notifications: [],
        summary: 'Unable to parse AI response',
        totalHighPriority: 0,
        totalMediumPriority: 0,
        totalLowPriority: 0,
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
