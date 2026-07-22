import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

export interface SkillResult {
  success: boolean;
  data?: any;
  error?: string;
  tokensUsed?: number;
}

@Injectable()
export class AISkillsService {
  private readonly logger = new Logger(AISkillsService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async summarizeText(text: string, maxLength: number = 500): Promise<SkillResult> {
    try {
      this.logger.log('Executing summarization skill');

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Summarize the following text in Turkish, maximum ${maxLength} characters. Keep key information and legal terms.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      return {
        success: true,
        data: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Summarization skill failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async analyzeRisk(text: string): Promise<SkillResult> {
    try {
      this.logger.log('Executing risk analysis skill');

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze the following text for legal risks. Return a JSON with:
            {
              "risks": [
                {
                  "type": "legal|financial|operational|reputation",
                  "severity": "high|medium|low",
                  "description": "risk description",
                  "mitigation": "mitigation strategy"
                }
              ],
              "overallRisk": "high|medium|low"
            }`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        success: true,
        data: result,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Risk analysis skill failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async detectDeadlines(text: string): Promise<SkillResult> {
    try {
      this.logger.log('Executing deadline detection skill');

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Extract deadlines from the following text. Return a JSON with:
            {
              "deadlines": [
                {
                  "date": "ISO date string",
                  "description": "deadline description",
                  "urgency": "high|medium|low",
                  "type": "hearing|submission|payment|other"
                }
              ]
            }`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        success: true,
        data: result,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Deadline detection skill failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async extractEntities(text: string): Promise<SkillResult> {
    try {
      this.logger.log('Executing entity extraction skill');

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Extract legal entities from the following text. Return a JSON with:
            {
              "dates": ["date1", "date2"],
              "persons": ["person1", "person2"],
              "companies": ["company1", "company2"],
              "courts": ["court1", "court2"],
              "laws": ["law1", "law2"],
              "obligations": ["obligation1", "obligation2"],
              "amounts": ["amount1", "amount2"]
            }`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        success: true,
        data: result,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Entity extraction skill failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async translateText(text: string, targetLanguage: string = 'en'): Promise<SkillResult> {
    try {
      this.logger.log(`Executing translation skill to ${targetLanguage}`);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}. Keep legal terminology accurate.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      return {
        success: true,
        data: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Translation skill failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async improveLegalWriting(text: string): Promise<SkillResult> {
    try {
      this.logger.log('Executing legal writing improvement skill');

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Improve the following legal text. Make it more professional, clear, and legally sound while maintaining the original meaning.',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      return {
        success: true,
        data: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Legal writing improvement skill failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
