import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class ReportAgent extends BaseAgent {
  readonly agentType = 'report';
  readonly purpose = 'Generate comprehensive reports';
  readonly responsibilities = [
    'Generate case reports',
    'Create client reports',
    'Generate financial reports',
    'Create activity reports',
    'Summarize performance',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'ReportAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Report Agent for LexMind AI, a legal practice management system.
    Your task is to generate comprehensive reports.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const reportType = context.input.reportType || 'general';
    const prompt = context.prompt || `Generate ${reportType} report: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "reportTitle": "Report title",
  "reportType": "${reportType}",
  "summary": "Executive summary",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content",
      "data": {
        "key": "value"
      }
    }
  ],
  "keyFindings": ["Finding 1", "Finding 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "charts": [
    {
      "type": "bar|line|pie",
      "title": "Chart title",
      "data": { "labels": [], "datasets": [] }
    }
  ],
  "generatedAt": "ISO date",
  "reasons": ["Reason 1", "Reason 2"],
  "sources": ["Source 1", "Source 2"],
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
        reportTitle: 'Unable to parse AI response',
        reportType: 'unknown',
        summary: 'Unable to parse AI response',
        sections: [],
        keyFindings: [],
        recommendations: [],
        charts: [],
        generatedAt: new Date().toISOString(),
        reasons: [],
        sources: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && input.reportType;
  }
}
