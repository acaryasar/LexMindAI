import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class CalendarAgent extends BaseAgent {
  readonly agentType = 'calendar';
  readonly purpose = 'Manage calendar events and scheduling';
  readonly responsibilities = [
    'Schedule events',
    'Detect conflicts',
    'Optimize schedule',
    'Send reminders',
    'Suggest meeting times',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.15;

  constructor(configService: ConfigService) {
    super(configService, 'CalendarAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Calendar Agent for LexMind AI, a legal practice management system.
    Your task is to manage calendar events and provide scheduling insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the calendar: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "scheduleAnalysis": "Overall schedule analysis",
  "conflicts": [
    { "event1": "Event 1", "event2": "Event 2", "time": "Conflict time", "suggestion": "Resolution suggestion" }
  ],
  "suggestedSlots": [
    { "date": "ISO date", "time": "Time", "duration": "Duration", "reason": "Suggestion reason" }
  ],
  "upcomingDeadlines": [
    { "deadline": "Deadline description", "date": "ISO date", "urgency": "high|medium|low" }
  ],
  "optimizationSuggestions": ["Suggestion 1", "Suggestion 2"],
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
        scheduleAnalysis: 'Unable to parse AI response',
        conflicts: [],
        suggestedSlots: [],
        upcomingDeadlines: [],
        optimizationSuggestions: [],
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
