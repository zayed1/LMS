import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          nameAr: true,
          nameEn: true,
          role: true,
          status: true,
          departmentId: true,
          department: {
            select: { id: true, nameAr: true, nameEn: true },
          },
          avatar: true,
          phone: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, nameAr: true, nameEn: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(`User with email "${dto.email}" already exists`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        nameAr: true,
        nameEn: true,
        role: true,
        status: true,
        departmentId: true,
        phone: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        nameAr: true,
        nameEn: true,
        role: true,
        status: true,
        departmentId: true,
        phone: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async bulkImportFromCsv(fileBuffer: Buffer) {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const record of records) {
      try {
        const existing = await this.prisma.user.findUnique({
          where: { email: record.email },
        });

        if (existing) {
          results.skipped++;
          results.errors.push(`User with email "${record.email}" already exists`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(
          record.password || 'DefaultPass@123',
          12,
        );

        await this.prisma.user.create({
          data: {
            email: record.email,
            password: hashedPassword,
            nameAr: record.nameAr,
            nameEn: record.nameEn,
            role: record.role || 'LEARNER',
            status: 'PENDING',
            departmentId: record.departmentId || null,
            phone: record.phone || null,
          },
        });

        results.created++;
      } catch (error: any) {
        results.errors.push(
          `Failed to import "${record.email}": ${error?.message || 'Unknown error'}`,
        );
      }
    }

    return results;
  }
}
