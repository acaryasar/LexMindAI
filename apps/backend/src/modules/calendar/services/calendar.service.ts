import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EmailService } from '@modules/email/services/email.service';

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createEvent(createEventDto: CreateEventDto, userId: string) {
    const { participantIds, caseId, ...eventData } = createEventDto;

    // Validate caseId for HEARING events
    if (createEventDto.type === 'HEARING' && !caseId) {
      throw new Error('HEARING türü için caseId zorunludur');
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        ...eventData,
        caseId: caseId || null,
        createdBy: userId,
      },
      include: {
        case: true,
      },
    });

    // Add participants (default to creator if none specified)
    const participantsToCreate = participantIds && participantIds.length > 0
      ? participantIds
      : [userId];

    await this.prisma.calendarEventParticipant.createMany({
      data: participantsToCreate.map((participantId) => ({
        eventId: event.id,
        userId: participantId,
        status: 'ACCEPTED',
        responseAt: new Date(),
      })),
      skipDuplicates: true,
    });

    // Send email invitations to participants
    const creator = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    const participants = await this.prisma.user.findMany({
      where: {
        id: { in: participantsToCreate.filter(id => id !== userId) },
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    // Send emails to all participants except the creator
    for (const participant of participants) {
      if (participant.email) {
        try {
          await this.emailService.sendCalendarEventInvitationEmail(
            participant.email,
            `${participant.firstName} ${participant.lastName}`,
            {
              title: event.title,
              date: event.date.toISOString(),
              time: event.time || undefined,
              location: event.location || undefined,
              type: event.type,
              notes: event.notes || undefined,
              caseNumber: event.case?.caseNumber || undefined,
            },
            `${creator?.firstName} ${creator?.lastName}`,
          );
        } catch (error) {
          console.error(`Failed to send email to ${participant.email}:`, error);
          // Don't throw error, continue with other participants
        }
      }
    }

    return event;
  }

  async getEvents(startDate?: Date, endDate?: Date, type?: string, userId?: string, userRoles?: string[]) {
    const where: any = {};

    // Role-based filtering - filter by participants OR createdBy (for backward compatibility)
    const isAdminOrPartner = userRoles?.includes('ADMIN') || userRoles?.includes('MANAGING_PARTNER');
    if (!isAdminOrPartner && userId) {
      where.OR = [
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
        {
          createdBy: userId,
        },
      ];
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
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
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

    // Role-based filtering - filter by participants OR createdBy (for backward compatibility)
    const isAdminOrPartner = userRoles?.includes('ADMIN') || userRoles?.includes('MANAGING_PARTNER');
    if (!isAdminOrPartner && userId) {
      where.OR = [
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
        {
          createdBy: userId,
        },
      ];
    }

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
