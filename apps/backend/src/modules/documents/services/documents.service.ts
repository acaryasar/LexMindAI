import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import * as crypto from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File, uploadDocumentDto: UploadDocumentDto, userId: string) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi');
    }

    // Generate hash
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Check if file with same hash exists
    const existing = await this.prisma.document.findFirst({
      where: { hash },
    });

    if (existing) {
      throw new BadRequestException('Bu dosya zaten yüklenmiş');
    }

    // Generate file path
    const fileName = `${Date.now()}-${file.originalname}`;
    const path = `uploads/${fileName}`;

    // In production, this would upload to S3/MinIO
    // For now, we'll just store the metadata
    const document = await this.prisma.document.create({
      data: {
        name: uploadDocumentDto.name,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: path,
        hash: hash,
        bucket: 'default',
        category: uploadDocumentDto.category,
        folderId: uploadDocumentDto.folderId,
        createdBy: userId,
      },
    });

    // Add tags if provided
    if (uploadDocumentDto.tags && uploadDocumentDto.tags.length > 0) {
      await this.prisma.documentTag.createMany({
        data: uploadDocumentDto.tags.map((tag) => ({
          documentId: document.id,
          tag,
          createdBy: userId,
        })),
      });
    }

    return document;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, category?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { fileName: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          folder: true,
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        tags: true,
        folder: true,
        versions: {
          orderBy: { version: 'desc' },
        },
        shares: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    // Update tags if provided
    if (updateDocumentDto.tags) {
      // Remove existing tags
      await this.prisma.documentTag.deleteMany({
        where: { documentId: id },
      });

      // Add new tags
      if (updateDocumentDto.tags.length > 0) {
        await this.prisma.documentTag.createMany({
          data: updateDocumentDto.tags.map((tag) => ({
            documentId: id,
            tag,
            createdBy: userId,
          })),
        });
      }
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        updatedBy: userId,
        tags: undefined, // Handle tags separately
      },
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    await this.prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async createVersion(id: string, file: Express.Multer.File, notes?: string, userId?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const newVersion = (document.versions[0]?.version || 0) + 1;

    const fileName = `${Date.now()}-${file.originalname}`;
    const path = `uploads/${fileName}`;

    const version = await this.prisma.documentVersion.create({
      data: {
        documentId: id,
        version: newVersion,
        fileName: file.originalname,
        path: path,
        size: file.size,
        notes: notes,
        createdBy: userId,
      },
    });

    return version;
  }

  async shareDocument(id: string, sharedWith: string, expiresAt?: Date, userId?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const share = await this.prisma.documentShare.create({
      data: {
        documentId: id,
        sharedWith,
        expiresAt,
        createdBy: userId,
      },
    });

    return share;
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { fileName: { contains: query, mode: 'insensitive' as const } },
            { tags: { some: { tag: { contains: query, mode: 'insensitive' as const } } } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
        },
      }),
      this.prisma.document.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { fileName: { contains: query, mode: 'insensitive' as const } },
            { tags: { some: { tag: { contains: query, mode: 'insensitive' as const } } } },
          ],
        },
      }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
