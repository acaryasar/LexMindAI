import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class HearingAgent extends BaseAgent {
  readonly agentType = 'hearing';
  readonly purpose = 'Prepare for court hearings and generate preparation materials';
  readonly responsibilities = [
    'Generate hearing preparation checklist',
    'Generate judge summary',
    'Generate case timeline',
    'Summarize evidence',
    'Predict potential questions',
    'Identify counter-arguments',
    'Create preparation notes',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.25;

  constructor(configService: ConfigService) {
    super(configService, 'HearingAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Hearing Agent for LexMind AI, a legal practice management system.
    Your task is to prepare for court hearings and generate preparation materials.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Prepare for the following hearing: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "preparationChecklist": [
    { "item": "Checklist item", "completed": false, "priority": "high|medium|low" }
  ],
  "judgeSummary": {
    "name": "Judge name",
    "background": "Judge background",
    "preferences": ["Preference 1", "Preference 2"]
  },
  "caseTimeline": [
    { "date": "ISO date", "event": "Event description", "significance": "high|medium|low" }
  ],
  "evidenceSummary": [
    { "evidence": "Evidence description", "relevance": "high|medium|low", "notes": "Notes" }
  ],
  "potentialQuestions": [
    { "question": "Question", "category": "category", "suggestedAnswer": "Suggested answer" }
  ],
  "counterArguments": [
    { "argument": "Counter argument", "strength": "strong|medium|weak", "rebuttal": "Rebuttal strategy" }
  ],
  "preparationNotes": "Additional preparation notes",
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
        preparationChecklist: [],
        judgeSummary: { name: 'Unknown', background: 'Unable to parse', preferences: [] },
        caseTimeline: [],
        evidenceSummary: [],
        potentialQuestions: [],
        counterArguments: [],
        preparationNotes: 'Unable to parse AI response',
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.hearingId || input.caseId);
  }
}
