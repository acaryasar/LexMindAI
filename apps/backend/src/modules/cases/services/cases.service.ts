import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateCaseDto } from '../dto/create-case.dto';
import { UpdateCaseDto } from '../dto/update-case.dto';
import { CreateCaseNoteDto } from '../dto/create-case-note.dto';
import { CreateCaseHearingDto } from '../dto/create-case-hearing.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async create(createCaseDto: CreateCaseDto, userId: string) {
    // Check if case number already exists
    const existing = await this.prisma.case.findUnique({
      where: { caseNumber: createCaseDto.caseNumber },
    });

    if (existing) {
      throw new ConflictException('Bu dava numarası zaten kayıtlı');
    }

    const caseData = await this.prisma.case.create({
      data: {
        ...createCaseDto,
        createdBy: userId,
      },
    });

    // Add clients if provided
    if (createCaseDto.clientIds && createCaseDto.clientIds.length > 0) {
      await this.prisma.caseClient.createMany({
        data: createCaseDto.clientIds.map((clientId) => ({
          caseId: caseData.id,
          clientId,
          role: 'CLIENT',
        })),
      });
    }

    // Add lawyers if provided
    if (createCaseDto.lawyerIds && createCaseDto.lawyerIds.length > 0) {
      await this.prisma.caseLawyer.createMany({
        data: createCaseDto.lawyerIds.map((lawyerId) => ({
          caseId: caseData.id,
          userId: lawyerId,
          role: 'LAWYER',
        })),
      });
    }

    return this.findOne(caseData.id);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } },
        { courtName: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          clients: {
            include: {
              client: true,
            },
          },
          lawyers: true,
          tags: true,
        },
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      data: cases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: {
        clients: {
          include: {
            client: true,
          },
        },
        lawyers: true,
        events: {
          orderBy: { date: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          include: {
            document: true,
          },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
        hearings: {
          orderBy: { date: 'asc' },
        },
        tags: true,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı');
    }

    return caseData;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto, userId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı');
    }

    const updated = await this.prisma.case.update({
      where: { id },
      data: {
        ...updateCaseDto,
        updatedBy: userId,
      },
    });

    // Update clients if provided
    if (updateCaseDto.clientIds) {
      // Remove existing clients
      await this.prisma.caseClient.deleteMany({
        where: { caseId: id },
      });

      // Add new clients
      if (updateCaseDto.clientIds.length > 0) {
        await this.prisma.caseClient.createMany({
          data: updateCaseDto.clientIds.map((clientId) => ({
            caseId: id,
            clientId,
            role: 'CLIENT',
          })),
        });
      }
    }

    // Update lawyers if provided
    if (updateCaseDto.lawyerIds) {
      // Remove existing lawyers
      await this.prisma.caseLawyer.deleteMany({
        where: { caseId: id },
      });

      // Add new lawyers
      if (updateCaseDto.lawyerIds.length > 0) {
        await this.prisma.caseLawyer.createMany({
          data: updateCaseDto.lawyerIds.map((lawyerId) => ({
            caseId: id,
            userId: lawyerId,
            role: 'LAWYER',
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı');
    }

    await this.prisma.case.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async addNote(caseId: string, createNoteDto: CreateCaseNoteDto, userId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı');
    }

    const note = await this.prisma.caseNote.create({
      data: {
        caseId,
        content: createNoteDto.content,
        createdBy: userId,
      },
    });

    return note;
  }

  async addHearing(caseId: string, createHearingDto: CreateCaseHearingDto, userId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı');
    }

    const hearing = await this.prisma.caseHearing.create({
      data: {
        caseId,
        ...createHearingDto,
        createdBy: userId,
      },
    });

    return hearing;
  }

  async getTimeline(caseId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı');
    }

    const events = await this.prisma.caseEvent.findMany({
      where: { caseId },
      orderBy: { date: 'desc' },
    });

    return events;
  }
}
