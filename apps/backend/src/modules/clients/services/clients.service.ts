import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { CreateClientContactDto } from '../dto/create-client-contact.dto';
import { CreateClientNoteDto } from '../dto/create-client-note.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

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

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
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

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: true,
          addresses: true,
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
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          include: {
            document: true,
          },
        },
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
}
