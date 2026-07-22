import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class PetitionAgent extends BaseAgent {
  readonly agentType = 'petition';
  readonly purpose = 'Generate legal documents including petitions, appeals, and responses';
  readonly responsibilities = [
    'Generate petitions',
    'Generate appeals',
    'Generate responses',
    'Generate objections',
    'Generate settlement letters',
    'Generate warnings',
    'Generate execution documents',
    'Improve legal language',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.4;

  constructor(configService: ConfigService) {
    super(configService, 'PetitionAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Petition Agent for LexMind AI, a legal practice management system.
    Your task is to generate legal documents with proper legal language and formatting.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const documentType = context.input.documentType || 'petition';
    const prompt = context.prompt || `Generate a ${documentType} based on the following context: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "documentType": "${documentType}",
  "title": "Document title",
  "content": "Full document content with proper legal language and formatting",
  "sections": [
    { "heading": "Section heading", "content": "Section content" }
  ],
  "legalReferences": ["Reference 1", "Reference 2"],
  "attachments": ["Attachment 1", "Attachment 2"],
  "reasons": ["Reason 1", "Reason 2"],
  "sources": ["Source 1", "Source 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "actions": [
    { "type": "action_type", "label": "Action label", "description": "Action description", "requiresApproval": true }
  ]
}`;
  }

  protected parseResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to parse JSON response:', error);
      return {
        documentType: 'unknown',
        title: 'Unable to parse AI response',
        content: 'Unable to parse AI response',
        sections: [],
        legalReferences: [],
        attachments: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && input.documentType;
  }
}
