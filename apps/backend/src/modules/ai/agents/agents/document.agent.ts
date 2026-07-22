import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class DocumentAgent extends BaseAgent {
  readonly agentType = 'document';
  readonly purpose = 'Analyze legal documents and extract key information';
  readonly responsibilities = [
    'Summarize documents',
    'Extract entities (dates, persons, companies, courts, laws, obligations)',
    'Perform risk analysis',
    'Identify key findings',
    'Provide recommendations',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.15;

  constructor(configService: ConfigService) {
    super(configService, 'DocumentAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Document Agent for LexMind AI, a legal practice management system.
    Your task is to analyze legal documents and extract key information.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the following document: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "summary": "Document summary",
  "entities": {
    "dates": ["Date 1", "Date 2"],
    "persons": ["Person 1", "Person 2"],
    "companies": ["Company 1", "Company 2"],
    "courts": ["Court 1", "Court 2"],
    "laws": ["Law 1", "Law 2"],
    "obligations": ["Obligation 1", "Obligation 2"]
  },
  "riskAnalysis": [
    { "risk": "Risk description", "severity": "high|medium|low", "mitigation": "Mitigation strategy" }
  ],
  "keyFindings": ["Finding 1", "Finding 2"],
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
        summary: 'Unable to parse AI response',
        entities: { dates: [], persons: [], companies: [], courts: [], laws: [], obligations: [] },
        riskAnalysis: [],
        keyFindings: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.documentId || input.documentContent);
  }
}
