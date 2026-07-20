import { Module } from '@nestjs/common';
import { HearingsController } from './controllers/hearings.controller';
import { HearingsService } from './services/hearings.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HearingsController],
  providers: [HearingsService],
  exports: [HearingsService],
})
export class HearingsModule {}
