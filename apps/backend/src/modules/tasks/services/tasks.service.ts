import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        createdBy: userId,
      },
    });

    return task;
  }

  async findAll(page: number = 1, limit: number = 10, status?: string, priority?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Görev bulunamadı');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Görev bulunamadı');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        updatedBy: userId,
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Görev bulunamadı');
    }

    await this.prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async addComment(taskId: string, createCommentDto: CreateTaskCommentDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Görev bulunamadı');
    }

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        content: createCommentDto.content,
        createdBy: userId,
      },
    });

    return comment;
  }

  async getUserTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: { dueDate: 'asc' },
      include: {
        comments: true,
      },
    });
  }
}
