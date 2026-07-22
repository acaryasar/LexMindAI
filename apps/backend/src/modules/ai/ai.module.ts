import { Module } from '@nestjs/common';
import { AIController } from './controllers/ai.controller';
import { AIService } from './services/ai.service';
import { AIGatewayService } from './gateway/ai-gateway.service';
import { DatabaseModule } from '@database/database.module';
import { AIOrchestrator } from './orchestrator/ai-orchestrator.service';
import { AIContextBuilder } from './context-builder/context-builder.service';
import { AIMemoryService } from './memory/memory.service';
import { PromptLibraryService } from './prompt-library/prompt-library.service';
import { AIAgentFactory } from './agents/agent-factory.service';
import { AICacheService } from './cache/cache.service';
import { TelemetryService } from './telemetry/telemetry.service';
import { AISkillsService } from './skills/skills.service';
import { AIToolsService } from './tools/tools.service';
import { AIProviderFactory } from './providers/provider-factory.service';
import { OpenAIProvider } from './providers/openai.provider';
import { DashboardAgent } from './agents/agents/dashboard.agent';
import { CaseAgent } from './agents/agents/case.agent';
import { ClientAgent } from './agents/agents/client.agent';
import { DocumentAgent } from './agents/agents/document.agent';
import { HearingAgent } from './agents/agents/hearing.agent';
import { PetitionAgent } from './agents/agents/petition.agent';
import { CalendarAgent } from './agents/agents/calendar.agent';
import { TaskAgent } from './agents/agents/task.agent';
import { ResearchAgent } from './agents/agents/research.agent';
import { CourtDecisionAgent } from './agents/agents/court-decision.agent';
import { FinanceAgent } from './agents/agents/finance.agent';
import { NotificationAgent } from './agents/agents/notification.agent';
import { TimelineAgent } from './agents/agents/timeline.agent';
import { ReportAgent } from './agents/agents/report.agent';
import { StrategyAgent } from './agents/agents/strategy.agent';
import { OCRAgent } from './agents/agents/ocr.agent';
import { TranslationAgent } from './agents/agents/translation.agent';
import { MeetingAgent } from './agents/agents/meeting.agent';
import { EmailAgent } from './agents/agents/email.agent';
import { VoiceAgent } from './agents/agents/voice.agent';

@Module({
  imports: [DatabaseModule],
  controllers: [AIController],
  providers: [
    AIService,
    AIGatewayService,
    AIOrchestrator,
    AIContextBuilder,
    AIMemoryService,
    PromptLibraryService,
    AIAgentFactory,
    AICacheService,
    TelemetryService,
    AISkillsService,
    AIToolsService,
    AIProviderFactory,
    OpenAIProvider,
    DashboardAgent,
    CaseAgent,
    ClientAgent,
    DocumentAgent,
    HearingAgent,
    PetitionAgent,
    CalendarAgent,
    TaskAgent,
    ResearchAgent,
    CourtDecisionAgent,
    FinanceAgent,
    NotificationAgent,
    TimelineAgent,
    ReportAgent,
    StrategyAgent,
    OCRAgent,
    TranslationAgent,
    MeetingAgent,
    EmailAgent,
    VoiceAgent,
  ],
  exports: [AIService, AIOrchestrator, AISkillsService, AIToolsService, AIProviderFactory],
})
export class AIModule {}
