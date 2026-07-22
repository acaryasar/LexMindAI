import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

export interface PromptTemplate {
  name: string;
  content: string;
  version: string;
  locale?: string;
  variables?: string[];
}

@Injectable()
export class PromptLibraryService {
  private readonly logger = new Logger(PromptLibraryService.name);
  private promptCache = new Map<string, PromptTemplate>();

  constructor(private prisma: PrismaService) {}

  async getPrompt(agentType: string, input: any, locale: string = 'tr'): Promise<string> {
    this.logger.log(`Getting prompt for agent: ${agentType}, locale: ${locale}`);

    // Check cache first
    const cacheKey = `${agentType}_${locale}`;
    if (this.promptCache.has(cacheKey)) {
      const template = this.promptCache.get(cacheKey);
      if (template) {
        return this.renderTemplate(template, input);
      }
    }

    // Load from database
    const prompt = await this.prisma.aIPrompt.findFirst({
      where: {
        name: `${agentType}_prompt`,
        status: 'ACTIVE',
      },
      orderBy: {
        version: 'desc',
      },
    });

    if (!prompt) {
      // Fallback to default prompt
      return this.getDefaultPrompt(agentType);
    }

    const template: PromptTemplate = {
      name: prompt.name,
      content: prompt.content,
      version: prompt.version,
      locale,
      variables: this.extractVariables(prompt.content),
    };

    // Cache the template
    this.promptCache.set(cacheKey, template);

    return this.renderTemplate(template, input);
  }

  async savePrompt(template: PromptTemplate): Promise<void> {
    this.logger.log(`Saving prompt: ${template.name}`);

    await this.prisma.aIPrompt.create({
      data: {
        name: template.name,
        description: `Prompt for ${template.name}`,
        category: 'agent',
        content: template.content,
        version: template.version,
        status: 'ACTIVE',
      },
    });

    // Clear cache
    this.clearCache();
  }

  async updatePrompt(name: string, content: string, version: string): Promise<void> {
    this.logger.log(`Updating prompt: ${name}`);

    await this.prisma.aIPrompt.updateMany({
      where: {
        name,
      },
      data: {
        status: 'INACTIVE',
      },
    });

    await this.prisma.aIPrompt.create({
      data: {
        name,
        description: `Updated prompt for ${name}`,
        category: 'agent',
        content,
        version,
        status: 'ACTIVE',
      },
    });

    // Clear cache
    this.clearCache();
  }

  async getPromptHistory(name: string): Promise<any[]> {
    const prompts = await this.prisma.aIPrompt.findMany({
      where: {
        name,
      },
      orderBy: {
        version: 'desc',
      },
    });

    return prompts.map((p) => ({
      version: p.version,
      content: p.content,
      status: p.status,
      createdAt: p.createdAt,
    }));
  }

  async deletePrompt(name: string): Promise<void> {
    this.logger.log(`Deleting prompt: ${name}`);

    await this.prisma.aIPrompt.updateMany({
      where: {
        name,
      },
      data: {
        status: 'DELETED',
      },
    });

    // Clear cache
    this.clearCache();
  }

  private renderTemplate(template: PromptTemplate, input: any): string {
    let content = template.content;

    // Replace variables with actual values
    if (template.variables) {
      template.variables.forEach((variable) => {
        const value = this.getNestedValue(input, variable);
        if (value !== undefined) {
          content = content.replace(`{{${variable}}}`, value);
        }
      });
    }

    return content;
  }

  private extractVariables(content: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      variables.push(match[1]);
    }

    return variables;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getDefaultPrompt(agentType: string): string {
    const defaultPrompts: Record<string, string> = {
      dashboard: `You are a Dashboard Agent for LexMind AI. Your task is to provide a comprehensive daily briefing for the lawyer. 
      {{context}}
      
      Please provide:
      1. Morning briefing summary
      2. Daily summary of activities
      3. Priority list with urgency levels
      4. Risk analysis for upcoming deadlines
      5. Time-saving suggestions
      6. AI insights and recommendations
      7. Important notifications
      
      Return your response in JSON format with structured data.`,
      
      case: `You are a Case Agent for LexMind AI. Your task is to analyze the provided case data and provide insights.
      {{context}}
      
      Please detect and report:
      1. Missing evidence or documents
      2. Potential risks
      3. Upcoming deadlines
      4. Similar cases (if available)
      5. Recommended strategy
      6. Success factors
      7. AI summary of the case
      
      Return your response in JSON format with structured data.`,
      
      client: `You are a Client Agent for LexMind AI. Your task is to analyze the client relationship and provide insights.
      {{context}}
      
      Please provide:
      1. Relationship history summary
      2. Pending matters and issues
      3. Communication recommendations
      4. Risk assessment
      5. Action items
      
      Return your response in JSON format with structured data.`,
      
      document: `You are a Document Agent for LexMind AI. Your task is to analyze the provided document.
      {{context}}
      
      Please provide:
      1. Document summary
      2. Entity extraction (dates, persons, companies, courts, laws, obligations)
      3. Risk analysis
      4. Key findings
      5. Recommendations
      
      Return your response in JSON format with structured data.`,
      
      hearing: `You are a Hearing Agent for LexMind AI. Your task is to prepare for the upcoming hearing.
      {{context}}
      
      Please generate:
      1. Hearing preparation checklist
      2. Judge summary
      3. Case timeline
      4. Evidence summary
      5. Potential questions
      6. Possible counter-arguments
      7. Preparation notes
      
      Return your response in JSON format with structured data.`,
      
      petition: `You are a Petition Agent for LexMind AI. Your task is to generate legal documents.
      {{context}}
      
      Please generate a {{documentType}} with:
      1. Proper legal language
      2. Correct formatting
      3. All required sections
      4. Professional tone
      5. Accurate legal references
      
      Return your response in JSON format with the document content.`,
    };

    return defaultPrompts[agentType] || `You are an AI agent for LexMind AI. Please assist with the request based on the provided context: {{context}}`;
  }

  private clearCache(): void {
    this.promptCache.clear();
  }
}
