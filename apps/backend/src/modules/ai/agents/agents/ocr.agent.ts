import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
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

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'OCRAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir OCR Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin belge görüntülerini analiz etmek ve metin çıkarmak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const prompt = context.prompt || `Belge görüntüsünden metin çıkar`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "extractedText": "Çıkarılan tam metin",
  "documentType": "contract|invoice|court_decision|letter|other",
  "confidence": 0.95,
  "structure": {
    "headers": ["Başlık 1", "Başlık 2"],
    "paragraphs": ["Paragraf 1", "Paragraf 2"],
    "tables": [
      {
        "headers": ["Sütun1", "Sütun2"],
        "rows": [["Satır1Sütun1", "Satır1Sütun2"], ["Satır2Sütun1", "Satır2Sütun2"]]
      }
    ]
  },
  "keyInformation": {
    "dates": ["Tarih 1", "Tarih 2"],
    "amounts": ["Tutar 1", "Tutar 2"],
    "parties": ["Taraf 1", "Taraf 2"]
  },
  "quality": "high|medium|low",
  "reasons": ["Neden 1", "Neden 2"],
  "sources": ["Kaynak 1", "Kaynak 2"],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "warnings": ["Uyarı 1", "Uyarı 2"],
  "actions": [
    { "type": "action_type", "label": "Eylem etiketi", "description": "Eylem açıklaması", "requiresApproval": false }
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
