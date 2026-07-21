import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { CreateClientContactDto } from '../dto/create-client-contact.dto';
import { CreateClientNoteDto } from '../dto/create-client-note.dto';
import { AssignLawyerDto } from '../dto/assign-lawyer.dto';
import { NotificationsService } from '@modules/notifications/services/notifications.service';
import { EmailService } from '@modules/email/services/email.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async create(createClientDto: CreateClientDto, userId: string) {
    // Check if nationalId or taxNumber already exists
    if (createClientDto.nationalId) {
      const existing = await this.prisma.client.findUnique({
        where: { nationalId: createClientDto.nationalId },
      });
      if (existing) {
        throw new ConflictException('Bu TCKN zaten kayıtlı');
      }
    }

    if (createClientDto.taxNumber) {
      const existing = await this.prisma.client.findUnique({
        where: { taxNumber: createClientDto.taxNumber },
      });
      if (existing) {
        throw new ConflictException('Bu vergi numarası zaten kayıtlı');
      }
    }

    const client = await this.prisma.client.create({
      data: {
        ...createClientDto,
        createdBy: userId,
      },
    });

    // Add to timeline
    await this.prisma.clientTimeline.create({
      data: {
        clientId: client.id,
        action: 'CLIENT_CREATED',
        details: 'Müşteri oluşturuldu',
        createdBy: userId,
      },
    });

    return client;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, userId?: string, userRole?: string) {
    const skip = (page - 1) * limit;

    // If user is lawyer, filter to only their assigned clients
    const clientFilter = userRole === 'LAWYER' && userId
      ? {
          lawyers: {
            some: {
              userId: userId,
              status: 'ACTIVE',
            },
          },
        }
      : {};

    const searchFilter = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } },
            { nationalId: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const where = {
      ...clientFilter,
      ...searchFilter,
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: true,
          addresses: true,
          lawyers: {
            where: { userId },
            include: { user: true },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
        addresses: true,
        documents: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        updatedBy: userId,
      },
    });

    // Add to timeline
    await this.prisma.clientTimeline.create({
      data: {
        clientId: id,
        action: 'CLIENT_UPDATED',
        details: 'Müşteri bilgileri güncellendi',
        createdBy: userId,
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    await this.prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Add to timeline
    await this.prisma.clientTimeline.create({
      data: {
        clientId: id,
        action: 'CLIENT_DELETED',
        details: 'Müşteri silindi',
        createdBy: userId,
      },
    });
  }

  async addContact(clientId: string, createContactDto: CreateClientContactDto, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    // If this is primary, remove primary from other contacts of same type
    if (createContactDto.isPrimary) {
      await this.prisma.clientContact.updateMany({
        where: {
          clientId,
          type: createContactDto.type,
        },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.clientContact.create({
      data: {
        clientId,
        ...createContactDto,
        createdBy: userId,
      },
    });

    return contact;
  }

  async addNote(clientId: string, createNoteDto: CreateClientNoteDto, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const note = await this.prisma.clientNote.create({
      data: {
        clientId,
        content: createNoteDto.content,
        createdBy: userId,
      },
    });

    return note;
  }

  async getTimeline(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const timeline = await this.prisma.clientTimeline.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return timeline;
  }

  async assignLawyer(clientId: string, assignLawyerDto: AssignLawyerDto, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const lawyer = await this.prisma.user.findUnique({
      where: { id: assignLawyerDto.userId },
    });

    if (!lawyer) {
      throw new NotFoundException('Avukat bulunamadı');
    }

    // Check if already assigned
    const existing = await this.prisma.clientLawyer.findUnique({
      where: {
        clientId_userId: {
          clientId,
          userId: assignLawyerDto.userId,
        },
      },
    });

    console.log('Checking existing assignment:', { clientId, userId: assignLawyerDto.userId, existing });

    if (existing && existing.status === 'ACTIVE') {
      throw new ConflictException('Bu avukat zaten atanmış');
    }

    // If existing but inactive, reactivate it
    if (existing && existing.status === 'INACTIVE') {
      const assignment = await this.prisma.clientLawyer.update({
        where: {
          clientId_userId: {
            clientId,
            userId: assignLawyerDto.userId,
          },
        },
        data: {
          status: 'ACTIVE',
          isPrimary: assignLawyerDto.isPrimary || false,
          assignedAt: new Date(),
        },
      });

      // Add to timeline
      await this.prisma.clientTimeline.create({
        data: {
          clientId,
          action: 'LAWYER_ASSIGNED',
          details: `${lawyer.firstName} ${lawyer.lastName} tekrar atandı. ${assignLawyerDto.reason || ''}`,
          createdBy: userId,
        },
      });

      // Create notification for the assigned lawyer
      await this.notificationsService.create({
        userId: assignLawyerDto.userId,
        type: 'LAWYER_ASSIGNED',
        title: 'Yeni Müvekkil Ataması',
        message: `${client.firstName} ${client.lastName} müvekkiline tekrar atandınız. ${assignLawyerDto.reason || ''}`,
        data: {
          clientId,
          clientName: `${client.firstName} ${client.lastName}`,
          isPrimary: assignLawyerDto.isPrimary,
        },
      });

      // Send email notification
      if (lawyer.email) {
        try {
          await this.emailService.sendLawyerAssignmentEmail(
            lawyer.email,
            `${lawyer.firstName} ${lawyer.lastName}`,
            'client',
            {
              name: `${client.firstName} ${client.lastName}`,
              reason: assignLawyerDto.reason,
              isPrimary: assignLawyerDto.isPrimary,
            },
          );
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the assignment if email fails
        }
      }

      return assignment;
    }

    // If setting as primary, remove primary from other lawyers
    if (assignLawyerDto.isPrimary) {
      await this.prisma.clientLawyer.updateMany({
        where: { clientId },
        data: { isPrimary: false },
      });
    }

    const assignment = await this.prisma.clientLawyer.create({
      data: {
        clientId,
        userId: assignLawyerDto.userId,
        isPrimary: assignLawyerDto.isPrimary || false,
        status: 'ACTIVE',
      },
    });

    // Add to timeline
    await this.prisma.clientTimeline.create({
      data: {
        clientId,
        action: 'LAWYER_ASSIGNED',
        details: `${lawyer.firstName} ${lawyer.lastName} atandı. ${assignLawyerDto.reason || ''}`,
        createdBy: userId,
      },
    });

    // Create notification for the assigned lawyer
    await this.notificationsService.create({
      userId: assignLawyerDto.userId,
      type: 'LAWYER_ASSIGNED',
      title: 'Yeni Müvekkil Ataması',
      message: `${client.firstName} ${client.lastName} müvekkiline atandınız. ${assignLawyerDto.reason || ''}`,
      data: {
        clientId,
        clientName: `${client.firstName} ${client.lastName}`,
        isPrimary: assignLawyerDto.isPrimary,
      },
    });

    // Send email notification
    if (lawyer.email) {
      try {
        await this.emailService.sendLawyerAssignmentEmail(
          lawyer.email,
          `${lawyer.firstName} ${lawyer.lastName}`,
          'client',
          {
            name: `${client.firstName} ${client.lastName}`,
            reason: assignLawyerDto.reason,
            isPrimary: assignLawyerDto.isPrimary,
          },
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the assignment if email fails
      }
    }

    return assignment;
  }

  async removeLawyer(clientId: string, lawyerId: string, userId: string, reason?: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const assignment = await this.prisma.clientLawyer.findUnique({
      where: {
        clientId_userId: {
          clientId,
          userId: lawyerId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Atama bulunamadı');
    }

    await this.prisma.clientLawyer.update({
      where: {
        clientId_userId: {
          clientId,
          userId: lawyerId,
        },
      },
      data: {
        status: 'INACTIVE',
      },
    });

    const lawyer = await this.prisma.user.findUnique({
      where: { id: lawyerId },
    });

    // Add to timeline
    await this.prisma.clientTimeline.create({
      data: {
        clientId,
        action: 'LAWYER_REMOVED',
        details: `${lawyer?.firstName || ''} ${lawyer?.lastName || ''} ataması kaldırıldı. ${reason || ''}`,
        createdBy: userId,
      },
    });

    // Create notification for the removed lawyer
    await this.notificationsService.create({
      userId: lawyerId,
      type: 'LAWYER_REMOVED',
      title: 'Müvekkil Ataması Kaldırıldı',
      message: `${client.firstName} ${client.lastName} müvekkilindeki atamanız kaldırıldı. ${reason || ''}`,
      data: {
        clientId,
        clientName: `${client.firstName} ${client.lastName}`,
      },
    });

    // Send email notification
    if (lawyer?.email) {
      try {
        await this.emailService.sendLawyerRemovalEmail(
          lawyer.email,
          `${lawyer.firstName} ${lawyer.lastName}`,
          'client',
          {
            name: `${client.firstName} ${client.lastName}`,
            reason,
          },
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the removal if email fails
      }
    }
  }

  async getClientLawyers(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const lawyers = await this.prisma.clientLawyer.findMany({
      where: { clientId, status: 'ACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return lawyers;
  }
}
