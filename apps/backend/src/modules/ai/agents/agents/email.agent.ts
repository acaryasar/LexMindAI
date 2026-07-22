import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class EmailAgent extends BaseAgent {
  readonly agentType = 'email';
  readonly purpose = 'Draft and manage email communications';
  readonly responsibilities = [
    'Draft emails',
    'Improve email tone',
    'Summarize email threads',
    'Extract action items',
    'Suggest responses',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'EmailAgent');
  }

  protected getSystemPrompt(): string {
    return `You are an Email Agent for LexMind AI, a legal practice management system.
    Your task is to draft and manage email communications.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const emailType = context.input.emailType || 'general';
    const prompt = context.prompt || `Draft ${emailType} email: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "subject": "Email subject",
  "body": "Email body content",
  "tone": "formal|semi-formal|informal",
  "recipient": "Recipient name",
  "cc": ["CC recipient 1", "CC recipient 2"],
  "attachments": ["Attachment 1", "Attachment 2"],
  "priority": "high|medium|low",
  "actionItems": [
    { "item": "Action item", "dueDate": "ISO date", "responsible": "Person" }
  ],
  "followUpNeeded": true,
  "followUpDate": "ISO date",
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
        subject: 'Unable to parse AI response',
        body: 'Unable to parse AI response',
        tone: 'formal',
        recipient: '',
        cc: [],
        attachments: [],
        priority: 'medium',
        actionItems: [],
        followUpNeeded: false,
        followUpDate: null,
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.emailContent || input.emailType);
  }
}
