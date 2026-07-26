import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseModule } from '@database/database.module';
import { WinstonLogger } from '@common/logger.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [WinstonLogger],
})
export class HealthModule {}
