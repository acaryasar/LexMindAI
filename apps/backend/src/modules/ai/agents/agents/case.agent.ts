import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class CaseAgent extends BaseAgent {
  readonly agentType = 'case';
  readonly purpose = 'Analyze legal cases and provide strategic insights';
  readonly responsibilities = [
    'Detect missing evidence',
    'Detect missing documents',
    'Identify risks',
    'Track deadlines',
    'Find similar cases',
    'Recommend strategy',
    'Identify success factors',
    'Generate AI summary',
  ];
  readonly confidence = 0.8;
  readonly riskScore = 0.3;

  constructor(configService: ConfigService) {
    super(configService, 'CaseAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Case Agent for LexMind AI, a legal practice management system.
    Your task is to analyze legal cases and provide strategic insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the following case: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "aiSummary": "Comprehensive case summary",
  "missingEvidence": ["Evidence 1", "Evidence 2"],
  "missingDocuments": ["Document 1", "Document 2"],
  "risks": [
    { "risk": "Risk description", "severity": "high|medium|low", "probability": "high|medium|low" }
  ],
  "deadlines": [
    { "deadline": "Deadline description", "date": "ISO date", "urgency": "high|medium|low" }
  ],
  "similarCases": [
    { "caseNumber": "Case number", "similarity": "high|medium|low", "keyPoints": ["Point 1", "Point 2"] }
  ],
  "recommendedStrategy": "Strategic recommendation",
  "successFactors": ["Factor 1", "Factor 2"],
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
        aiSummary: 'Unable to parse AI response',
        missingEvidence: [],
        missingDocuments: [],
        risks: [],
        deadlines: [],
        similarCases: [],
        recommendedStrategy: 'Unable to parse AI response',
        successFactors: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.caseId || input.caseNumber);
  }
}
