import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateHearingDto } from '../dto/create-hearing.dto';
import { UpdateHearingDto } from '../dto/update-hearing.dto';

@Injectable()
export class HearingsService {
  constructor(private prisma: PrismaService) {}

  async create(createHearingDto: CreateHearingDto, userId: string) {
    // Verify case exists
    const caseExists = await this.prisma.case.findUnique({
      where: { id: createHearingDto.caseId },
    });

    if (!caseExists) {
      throw new NotFoundException('Belirtilen dava bulunamadı');
    }

    return this.prisma.caseHearing.create({
      data: {
        caseId: createHearingDto.caseId,
        date: new Date(createHearingDto.date),
        time: createHearingDto.time,
        location: createHearingDto.location,
        notes: createHearingDto.notes,
        createdBy: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, caseId?: string, userId?: string, userRole?: string) {
    const where: any = {};

    // If user is lawyer, filter to only hearings from their assigned cases
    if (userRole === 'LAWYER' && userId) {
      where.case = {
        lawyers: {
          some: {
            userId: userId,
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { location: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (caseId) {
      where.caseId = caseId;
    }

    const [data, total] = await Promise.all([
      this.prisma.caseHearing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.caseHearing.count({ where }),
    ]);

    return {
      data: data.map((hearing) => ({
        id: hearing.id,
        caseId: hearing.caseId,
        caseNumber: hearing.case?.caseNumber,
        caseTitle: hearing.case?.title,
        date: hearing.date.toISOString(),
        time: hearing.time,
        location: hearing.location,
        notes: hearing.notes,
        createdAt: hearing.createdAt.toISOString(),
        updatedAt: hearing.updatedAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const hearing = await this.prisma.caseHearing.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            lawyers: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!hearing) {
      throw new NotFoundException('Duruşma bulunamadı');
    }

    // Authorization check - IDOR protection
    const isAdminOrPartner = userRole === 'ADMIN' || userRole === 'MANAGING_PARTNER';
    const isAssignedLawyer = hearing.case?.lawyers?.some(
      (lawyer) => lawyer.userId === userId
    );

    if (!isAdminOrPartner && !isAssignedLawyer) {
      throw new ForbiddenException('Bu duruşmaya erişim yetkiniz yok');
    }

    return {
      id: hearing.id,
      caseId: hearing.caseId,
      caseNumber: hearing.case?.caseNumber,
      caseTitle: hearing.case?.title,
      date: hearing.date.toISOString(),
      time: hearing.time,
      location: hearing.location,
      notes: hearing.notes,
      createdAt: hearing.createdAt.toISOString(),
      updatedAt: hearing.updatedAt.toISOString(),
    };
  }

  async update(id: string, updateHearingDto: UpdateHearingDto, userId?: string, userRole?: string) {
    const hearing = await this.prisma.caseHearing.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            lawyers: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!hearing) {
      throw new NotFoundException('Duruşma bulunamadı');
    }

    // Authorization check - IDOR protection
    const isAdminOrPartner = userRole === 'ADMIN' || userRole === 'MANAGING_PARTNER';
    const isAssignedLawyer = hearing.case?.lawyers?.some(
      (lawyer) => lawyer.userId === userId
    );

    if (!isAdminOrPartner && !isAssignedLawyer) {
      throw new ForbiddenException('Bu duruşmayı güncelleme yetkiniz yok');
    }

    return this.prisma.caseHearing.update({
      where: { id },
      data: {
        ...(updateHearingDto.date && { date: new Date(updateHearingDto.date) }),
        ...(updateHearingDto.time && { time: updateHearingDto.time }),
        ...(updateHearingDto.location && { location: updateHearingDto.location }),
        ...(updateHearingDto.notes !== undefined && { notes: updateHearingDto.notes }),
      },
    });
  }

  async remove(id: string, userId?: string, userRole?: string) {
    const hearing = await this.prisma.caseHearing.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            lawyers: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!hearing) {
      throw new NotFoundException('Duruşma bulunamadı');
    }

    // Authorization check - IDOR protection
    const isAdminOrPartner = userRole === 'ADMIN' || userRole === 'MANAGING_PARTNER';
    const isAssignedLawyer = hearing.case?.lawyers?.some(
      (lawyer) => lawyer.userId === userId
    );

    if (!isAdminOrPartner && !isAssignedLawyer) {
      throw new ForbiddenException('Bu duruşmayı silme yetkiniz yok');
    }

    await this.prisma.caseHearing.delete({
      where: { id },
    });
  }
}
