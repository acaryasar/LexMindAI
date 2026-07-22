import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CasesModule } from './modules/cases/cases.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AIModule } from './modules/ai/ai.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FinanceModule } from './modules/finance/finance.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { DailyPlannerModule } from './modules/daily-planner/daily-planner.module';
import { HearingsModule } from './modules/hearings/hearings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    DatabaseModule,
    AuthModule,
    ClientsModule,
    CasesModule,
    DocumentsModule,
    AIModule,
    CalendarModule,
    TasksModule,
    FinanceModule,
    RecommendationsModule,
    DailyPlannerModule,
    HearingsModule,
    NotificationsModule,
    EmailModule,
    ReportsModule,
  ],
})
export class AppModule {}
