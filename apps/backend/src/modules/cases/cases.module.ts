import { Module } from '@nestjs/common';
import { CasesController } from './controllers/cases.controller';
import { CasesService } from './services/cases.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
