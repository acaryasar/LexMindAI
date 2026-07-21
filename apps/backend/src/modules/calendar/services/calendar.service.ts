import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, userId: string) {
    const event = await this.prisma.calendarEvent.create({
      data: {
        ...createEventDto,
        createdBy: userId,
      },
    });

    return event;
  }

  async getEvents(startDate?: Date, endDate?: Date, type?: string, userId?: string, userRoles?: string[]) {
    const where: any = {};

    // Role-based filtering
    const isAdminOrPartner = userRoles?.includes('ADMIN') || userRoles?.includes('MANAGING_PARTNER');
    if (!isAdminOrPartner && userId) {
      where.createdBy = userId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async getEvent(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadı');
    }

    return event;
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadı');
    }

    const updated = await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...updateEventDto,
        updatedBy: userId,
      },
    });

    return updated;
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadı');
    }

    await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getUpcomingEvents(days: number = 7, userId?: string, userRoles?: string[]) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const where: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Role-based filtering
    const isAdminOrPartner = userRoles?.includes('ADMIN') || userRoles?.includes('MANAGING_PARTNER');
    if (!isAdminOrPartner && userId) {
      where.createdBy = userId;
    }

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }
}
