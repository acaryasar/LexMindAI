import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DailyPlannerService } from '../services/daily-planner.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Daily AI Planner')
@Controller('daily-planner')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DailyPlannerController {
  constructor(private readonly dailyPlannerService: DailyPlannerService) {}

  @Get()
  @ApiOperation({ summary: 'Get daily plan for current user' })
  getDailyPlan(@Request() req: RequestWithUser) {
    return this.dailyPlannerService.getDailyPlan(req.user.id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate daily plan' })
  generateDailyPlan(@Request() req: RequestWithUser) {
    return this.dailyPlannerService.generateDailyPlan(req.user.id);
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize daily schedule' })
  optimizeDay(@Request() req: RequestWithUser) {
    return this.dailyPlannerService.optimizeDay(req.user.id);
  }
}
