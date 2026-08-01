import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
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

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'PetitionAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Petition Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin uygun hukuk dili ve formatıyla hukuk belgeleri oluşturmak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const documentType = context.input.documentType || 'petition';
    const prompt = context.prompt || `Aşağıdaki bağlama dayanarak bir ${documentType} oluştur: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "documentType": "${documentType}",
  "title": "Belge başlığı",
  "content": "Uygun hukuk dili ve formatıyla tam belge içeriği",
  "sections": [
    { "heading": "Bölüm başlığı", "content": "Bölüm içeriği" }
  ],
  "legalReferences": ["Referans 1", "Referans 2"],
  "attachments": ["Ek 1", "Ek 2"],
  "reasons": ["Neden 1", "Neden 2"],
  "sources": ["Kaynak 1", "Kaynak 2"],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "warnings": ["Uyarı 1", "Uyarı 2"],
  "actions": [
    { "type": "action_type", "label": "Eylem etiketi", "description": "Eylem açıklaması", "requiresApproval": true }
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
