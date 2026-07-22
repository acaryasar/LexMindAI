import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class OCRAgent extends BaseAgent {
  readonly agentType = 'ocr';
  readonly purpose = 'Perform OCR and document text extraction';
  readonly responsibilities = [
    'Extract text from images',
    'Recognize handwritten text',
    'Extract tables',
    'Identify document structure',
    'Process scanned documents',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'OCRAgent');
  }

  protected getSystemPrompt(): string {
    return `You are an OCR Agent for LexMind AI, a legal practice management system.
    Your task is to analyze document images and extract text.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const prompt = context.prompt || `Extract text from document image`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "extractedText": "Full extracted text",
  "documentType": "contract|invoice|court_decision|letter|other",
  "confidence": 0.95,
  "structure": {
    "headers": ["Header 1", "Header 2"],
    "paragraphs": ["Paragraph 1", "Paragraph 2"],
    "tables": [
      {
        "headers": ["Col1", "Col2"],
        "rows": [["Row1Col1", "Row1Col2"], ["Row2Col1", "Row2Col2"]]
      }
    ]
  },
  "keyInformation": {
    "dates": ["Date 1", "Date 2"],
    "amounts": ["Amount 1", "Amount 2"],
    "parties": ["Party 1", "Party 2"]
  },
  "quality": "high|medium|low",
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
        extractedText: 'Unable to parse AI response',
        documentType: 'unknown',
        confidence: 0,
        structure: { headers: [], paragraphs: [], tables: [] },
        keyInformation: { dates: [], amounts: [], parties: [] },
        quality: 'unknown',
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.imageUrl || input.imageData);
  }
}
