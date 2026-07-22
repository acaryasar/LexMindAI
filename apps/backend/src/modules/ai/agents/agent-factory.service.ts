import { Injectable, Logger } from '@nestjs/common';
import { IAIAgent } from './interfaces/agent.interface';
import { DashboardAgent } from './agents/dashboard.agent';
import { CaseAgent } from './agents/case.agent';
import { ClientAgent } from './agents/client.agent';
import { DocumentAgent } from './agents/document.agent';
import { HearingAgent } from './agents/hearing.agent';
import { PetitionAgent } from './agents/petition.agent';
import { CalendarAgent } from './agents/calendar.agent';
import { TaskAgent } from './agents/task.agent';
import { ResearchAgent } from './agents/research.agent';
import { CourtDecisionAgent } from './agents/court-decision.agent';
import { FinanceAgent } from './agents/finance.agent';
import { NotificationAgent } from './agents/notification.agent';
import { TimelineAgent } from './agents/timeline.agent';
import { ReportAgent } from './agents/report.agent';
import { StrategyAgent } from './agents/strategy.agent';
import { OCRAgent } from './agents/ocr.agent';
import { TranslationAgent } from './agents/translation.agent';
import { MeetingAgent } from './agents/meeting.agent';
import { EmailAgent } from './agents/email.agent';
import { VoiceAgent } from './agents/voice.agent';

@Injectable()
export class AIAgentFactory {
  private readonly logger = new Logger(AIAgentFactory.name);
  private agents = new Map<string, IAIAgent>();

  constructor(
    private dashboardAgent: DashboardAgent,
    private caseAgent: CaseAgent,
    private clientAgent: ClientAgent,
    private documentAgent: DocumentAgent,
    private hearingAgent: HearingAgent,
    private petitionAgent: PetitionAgent,
    private calendarAgent: CalendarAgent,
    private taskAgent: TaskAgent,
    private researchAgent: ResearchAgent,
    private courtDecisionAgent: CourtDecisionAgent,
    private financeAgent: FinanceAgent,
    private notificationAgent: NotificationAgent,
    private timelineAgent: TimelineAgent,
    private reportAgent: ReportAgent,
    private strategyAgent: StrategyAgent,
    private ocrAgent: OCRAgent,
    private translationAgent: TranslationAgent,
    private meetingAgent: MeetingAgent,
    private emailAgent: EmailAgent,
    private voiceAgent: VoiceAgent,
  ) {
    this.registerAgents();
  }

  private registerAgents(): void {
    this.agents.set('dashboard', this.dashboardAgent);
    this.agents.set('case', this.caseAgent);
    this.agents.set('client', this.clientAgent);
    this.agents.set('document', this.documentAgent);
    this.agents.set('hearing', this.hearingAgent);
    this.agents.set('petition', this.petitionAgent);
    this.agents.set('calendar', this.calendarAgent);
    this.agents.set('task', this.taskAgent);
    this.agents.set('research', this.researchAgent);
    this.agents.set('court-decision', this.courtDecisionAgent);
    this.agents.set('finance', this.financeAgent);
    this.agents.set('notification', this.notificationAgent);
    this.agents.set('timeline', this.timelineAgent);
    this.agents.set('report', this.reportAgent);
    this.agents.set('strategy', this.strategyAgent);
    this.agents.set('ocr', this.ocrAgent);
    this.agents.set('translation', this.translationAgent);
    this.agents.set('meeting', this.meetingAgent);
    this.agents.set('email', this.emailAgent);
    this.agents.set('voice', this.voiceAgent);

    this.logger.log(`Registered ${this.agents.size} agents`);
  }

  getAgent(agentType: string): IAIAgent | undefined {
    return this.agents.get(agentType);
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  registerAgent(agentType: string, agent: IAIAgent): void {
    this.agents.set(agentType, agent);
    this.logger.log(`Registered agent: ${agentType}`);
  }

  unregisterAgent(agentType: string): void {
    this.agents.delete(agentType);
    this.logger.log(`Unregistered agent: ${agentType}`);
  }
}
