import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class TranslationAgent extends BaseAgent {
  readonly agentType = 'translation';
  readonly purpose = 'Translate legal documents and communications';
  readonly responsibilities = [
    'Translate documents',
    'Maintain legal terminology',
    'Preserve meaning',
    'Handle cultural nuances',
    'Translate communications',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.15;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'TranslationAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Translation Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin hukuk belgelerini ve iletişimlerini çevirmek.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const targetLanguage = context.input.targetLanguage || 'English';
    const sourceText = context.input.sourceText || '';
    const prompt = context.prompt || `${targetLanguage} diline çevir`;
    
    return `${prompt}

Kaynak metin: ${sourceText}
Hedef dil: ${targetLanguage}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "translatedText": "Tam çevrilmiş metin",
  "sourceLanguage": "Tespit edilen kaynak dil",
  "targetLanguage": "${targetLanguage}",
  "confidence": 0.95,
  "terminologyNotes": [
    { "term": "Hukuk terimi", "translation": "Çeviri", "context": "Bağlam" }
  ],
  "culturalNotes": ["Kültürel nüans 1", "Kültürel nüans 2"],
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
        translatedText: 'Unable to parse AI response',
        sourceLanguage: 'unknown',
        targetLanguage: 'unknown',
        confidence: 0,
        terminologyNotes: [],
        culturalNotes: [],
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
    return super.validateInput(input) && (input.sourceText || input.documentId);
  }
}
