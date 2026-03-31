import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, filters?: { status?: string; modality?: string; categoryId?: string; instructorId?: string }) {
    const { page, limit, search, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (filters?.status) where.status = filters.status;
    if (filters?.modality) where.modality = filters.modality;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.instructorId) where.instructorId = filters.instructorId;

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          instructor: { select: { id: true, nameAr: true, nameEn: true } },
          category: { select: { id: true, nameAr: true, nameEn: true } },
          _count: { select: { modules: true, enrollments: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, nameAr: true, nameEn: true, email: true } },
        category: true,
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('الدورة غير موجودة');
    return course;
  }

  async create(dto: CreateCourseDto, userId: string) {
    return this.prisma.course.create({
      data: {
        ...dto,
        instructorId: dto.instructorId || userId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        instructor: { select: { id: true, nameAr: true, nameEn: true } },
        category: true,
      },
    });
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findById(id);
    return this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        instructor: { select: { id: true, nameAr: true, nameEn: true } },
        category: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.course.delete({ where: { id } });
  }

  async publish(id: string) {
    await this.findById(id);
    return this.prisma.course.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async archive(id: string) {
    await this.findById(id);
    return this.prisma.course.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  // Module operations
  async addModule(dto: CreateModuleDto) {
    const course = await this.findById(dto.courseId);
    const maxSort = course.modules.length > 0
      ? Math.max(...course.modules.map(m => m.sortOrder)) + 1
      : 0;

    return this.prisma.courseModule.create({
      data: { ...dto, sortOrder: dto.sortOrder ?? maxSort },
      include: { lessons: true },
    });
  }

  async updateModule(id: string, dto: UpdateModuleDto) {
    return this.prisma.courseModule.update({
      where: { id },
      data: dto,
      include: { lessons: true },
    });
  }

  async deleteModule(id: string) {
    return this.prisma.courseModule.delete({ where: { id } });
  }

  // Lesson operations
  async addLesson(dto: CreateLessonDto) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: dto.moduleId },
      include: { lessons: true },
    });
    if (!mod) throw new NotFoundException('الوحدة غير موجودة');

    const maxSort = mod.lessons.length > 0
      ? Math.max(...mod.lessons.map(l => l.sortOrder)) + 1
      : 0;

    return this.prisma.lesson.create({
      data: { ...dto, sortOrder: dto.sortOrder ?? maxSort },
    });
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    return this.prisma.lesson.update({ where: { id }, data: dto });
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  // Reordering
  async reorderModules(courseId: string, moduleIds: string[]) {
    const updates = moduleIds.map((id, index) =>
      this.prisma.courseModule.update({ where: { id }, data: { sortOrder: index } }),
    );
    return this.prisma.$transaction(updates);
  }

  async reorderLessons(moduleId: string, lessonIds: string[]) {
    const updates = lessonIds.map((id, index) =>
      this.prisma.lesson.update({ where: { id }, data: { sortOrder: index } }),
    );
    return this.prisma.$transaction(updates);
  }
}
