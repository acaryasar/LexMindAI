import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from '../services/recommendations.service';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';
import { UpdateRecommendationDto } from '../dto/update-recommendation.dto';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { ExecuteWorkflowDto } from '../dto/execute-workflow.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('AI Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  // ==================== RECOMMENDATIONS ====================

  @Post()
  @ApiOperation({ summary: 'Create a new AI recommendation' })
  create(@Request() req: RequestWithUser, @Body() dto: CreateRecommendationDto) {
    return this.recommendationsService.createRecommendation(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recommendations for current user' })
  findAll(@Request() req: RequestWithUser) {
    return this.recommendationsService.getRecommendations(req.user.id);
  }

  @Get('top-priority')
  @ApiOperation({ summary: 'Get top priority recommendation' })
  getTopPriority(@Request() req: RequestWithUser) {
    return this.recommendationsService.getTopPriorityRecommendation(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recommendation by ID' })
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.getRecommendationById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recommendation' })
  update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateRecommendationDto,
  ) {
    return this.recommendationsService.updateRecommendation(id, req.user.id, dto);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss recommendation' })
  dismiss(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.dismissRecommendation(id, req.user.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark recommendation as completed' })
  complete(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.completeRecommendation(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recommendation' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.deleteRecommendation(id, req.user.id);
  }

  // ==================== WORKFLOWS ====================

  @Post('workflows')
  @ApiOperation({ summary: 'Create a new workflow' })
  createWorkflow(@Request() req: RequestWithUser, @Body() dto: CreateWorkflowDto) {
    return this.recommendationsService.createWorkflow(dto, req.user.id);
  }

  @Get('workflows')
  @ApiOperation({ summary: 'Get all workflows' })
  getWorkflows() {
    return this.recommendationsService.getWorkflows();
  }

  @Get('workflows/:id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  getWorkflow(@Param('id') id: string) {
    return this.recommendationsService.getWorkflowById(id);
  }

  @Post('workflows/execute')
  @ApiOperation({ summary: 'Execute a workflow' })
  executeWorkflow(@Request() req: RequestWithUser, @Body() dto: ExecuteWorkflowDto) {
    return this.recommendationsService.executeWorkflow(req.user.id, dto);
  }

  @Get('workflows/executions/:id')
  @ApiOperation({ summary: 'Get workflow execution status' })
  getWorkflowExecution(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.getWorkflowExecution(id, req.user.id);
  }

  @Patch('workflows/executions/:id/pause')
  @ApiOperation({ summary: 'Pause workflow execution' })
  pauseWorkflowExecution(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.pauseWorkflowExecution(id, req.user.id);
  }

  @Patch('workflows/executions/:id/resume')
  @ApiOperation({ summary: 'Resume workflow execution' })
  resumeWorkflowExecution(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.resumeWorkflowExecution(id, req.user.id);
  }

  @Patch('workflows/executions/:id/cancel')
  @ApiOperation({ summary: 'Cancel workflow execution' })
  cancelWorkflowExecution(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recommendationsService.cancelWorkflowExecution(id, req.user.id);
  }
}
