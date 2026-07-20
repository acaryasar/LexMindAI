import { Module } from '@nestjs/common';
import { RecommendationsController } from './controllers/recommendations.controller';
import { RecommendationsService } from './services/recommendations.service';
import { ScreenContextService } from './services/screen-context.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, ScreenContextService],
  exports: [RecommendationsService, ScreenContextService],
})
export class RecommendationsModule {}
