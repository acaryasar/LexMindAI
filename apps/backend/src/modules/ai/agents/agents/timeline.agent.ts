import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class TimelineAgent extends BaseAgent {
  readonly agentType = 'timeline';
  readonly purpose = 'Generate case timelines and chronologies';
  readonly responsibilities = [
    'Generate timelines',
    'Track milestones',
    'Identify dependencies',
    'Visualize progress',
    'Predict completion',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.15;

  constructor(configService: ConfigService) {
    super(configService, 'TimelineAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Timeline Agent for LexMind AI, a legal practice management system.
    Your task is to generate case timelines and chronologies.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Generate timeline: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "timeline": [
    {
      "date": "ISO date",
      "event": "Event description",
      "type": "milestone|deadline|hearing|filing|other",
      "status": "completed|pending|overdue",
      "importance": "high|medium|low",
      "dependencies": ["dependency1", "dependency2"]
    }
  ],
  "milestones": [
    { "milestone": "Milestone name", "date": "ISO date", "status": "completed|pending" }
  ],
  "criticalPath": ["event1", "event2", "event3"],
  "estimatedCompletion": "ISO date",
  "riskFactors": ["Risk 1", "Risk 2"],
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
        timeline: [],
        milestones: [],
        criticalPath: [],
        estimatedCompletion: null,
        riskFactors: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.caseId || input.events);
  }
}
