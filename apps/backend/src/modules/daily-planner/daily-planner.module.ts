import { Module } from '@nestjs/common';
import { DailyPlannerController } from './controllers/daily-planner.controller';
import { DailyPlannerService } from './services/daily-planner.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DailyPlannerController],
  providers: [DailyPlannerService],
  exports: [DailyPlannerService],
})
export class DailyPlannerModule {}
