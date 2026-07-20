import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni görev oluştur' })
  @ApiResponse({ status: 201, description: 'Görev başarıyla oluşturuldu' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Görev listesi' })
  @ApiResponse({ status: 200, description: 'Görev listesi getirildi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.tasksService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      priority,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Görev detayı' })
  @ApiResponse({ status: 200, description: 'Görev detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Görev güncelle' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Görev sil' })
  @ApiResponse({ status: 204, description: 'Görev başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Görev yorumu ekle' })
  @ApiResponse({ status: 201, description: 'Yorum başarıyla eklendi' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı' })
  addComment(@Param('id') id: string, @Body() createCommentDto: CreateTaskCommentDto, @Request() req: any) {
    return this.tasksService.addComment(id, createCommentDto, req.user.id);
  }

  @Get('my/tasks')
  @ApiOperation({ summary: 'Kullanıcının görevleri' })
  @ApiResponse({ status: 200, description: 'Görevler getirildi' })
  getMyTasks(@Request() req: any) {
    return this.tasksService.getUserTasks(req.user.id);
  }
}
