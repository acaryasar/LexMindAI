import { Module } from '@nestjs/common';
import { CalendarController } from './controllers/calendar.controller';
import { CalendarService } from './services/calendar.service';
import { DatabaseModule } from '@database/database.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
