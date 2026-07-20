import { Module } from '@nestjs/common';
import { AIController } from './controllers/ai.controller';
import { AIService } from './services/ai.service';
import { AIGatewayService } from './gateway/ai-gateway.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AIController],
  providers: [AIService, AIGatewayService],
  exports: [AIService],
})
export class AIModule {}
