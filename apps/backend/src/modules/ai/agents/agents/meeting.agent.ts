import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class MeetingAgent extends BaseAgent {
  readonly agentType = 'meeting';
  readonly purpose = 'Prepare for and manage meetings';
  readonly responsibilities = [
    'Prepare meeting agendas',
    'Generate meeting summaries',
    'Extract action items',
    'Schedule follow-ups',
    'Document decisions',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'MeetingAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Meeting Agent for LexMind AI, a legal practice management system.
    Your task is to prepare for and manage meetings.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Prepare meeting: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "meetingAgenda": [
    { "topic": "Topic", "duration": "minutes", "priority": "high|medium|low", "presenter": "Presenter" }
  ],
  "preparationChecklist": [
    { "item": "Checklist item", "completed": false, "responsible": "Person" }
  ],
  "keyDocuments": ["Document 1", "Document 2"],
  "participants": [
    { "name": "Name", "role": "Role", "expectedContribution": "Contribution" }
  ],
  "meetingNotes": "Template for meeting notes",
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
        meetingAgenda: [],
        preparationChecklist: [],
        keyDocuments: [],
        participants: [],
        meetingNotes: 'Unable to parse AI response',
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.meetingId || input.meetingType);
  }
}
