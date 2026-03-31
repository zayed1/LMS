import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('الدورة غير موجودة');
    if (course.status !== 'PUBLISHED') throw new BadRequestException('الدورة غير متاحة للتسجيل');

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ConflictException('أنت مسجل بالفعل في هذه الدورة');

    if (course.maxEnrollment) {
      const count = await this.prisma.enrollment.count({ where: { courseId } });
      if (count >= course.maxEnrollment) throw new BadRequestException('الدورة ممتلئة');
    }

    return this.prisma.enrollment.create({
      data: { userId, courseId, status: 'ENROLLED' },
      include: { course: { select: { id: true, titleAr: true, titleEn: true } } },
    });
  }

  async unenroll(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('التسجيل غير موجود');

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'DROPPED' },
    });
  }

  async getMyEnrollments(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.enrollment.findMany({
      where,
      include: {
        course: {
          include: {
            instructor: { select: { id: true, nameAr: true, nameEn: true } },
            category: { select: { id: true, nameAr: true, nameEn: true } },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async getCourseEnrollments(courseId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { courseId },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, nameAr: true, nameEn: true, email: true, avatar: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where: { courseId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateLessonProgress(userId: string, lessonId: string, data: { completed?: boolean; timeSpent?: number }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException('الدرس غير موجود');

    const courseId = lesson.module.courseId;

    // Upsert lesson progress
    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: data.completed ?? false,
        timeSpent: data.timeSpent ?? 0,
        completedAt: data.completed ? new Date() : null,
      },
      update: {
        completed: data.completed,
        timeSpent: data.timeSpent ? { increment: data.timeSpent } : undefined,
        lastAccessed: new Date(),
        completedAt: data.completed ? new Date() : undefined,
      },
    });

    // Recalculate course progress
    const totalLessons = await this.prisma.lesson.count({
      where: { module: { courseId } },
    });
    const completedLessons = await this.prisma.lessonProgress.count({
      where: { userId, completed: true, lesson: { module: { courseId } } },
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await this.prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: {
        progress: percentage,
        status: percentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: percentage === 100 ? new Date() : null,
      },
    });

    return { progress, courseProgress: percentage };
  }

  async getMyCourseProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('التسجيل غير موجود');

    const modules = await this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
          include: {
            progress: { where: { userId } },
          },
        },
      },
    });

    return {
      enrollment,
      modules: modules.map(mod => ({
        ...mod,
        lessons: mod.lessons.map(lesson => ({
          id: lesson.id,
          titleAr: lesson.titleAr,
          titleEn: lesson.titleEn,
          type: lesson.type,
          duration: lesson.duration,
          completed: lesson.progress.length > 0 && lesson.progress[0].completed,
          timeSpent: lesson.progress.length > 0 ? lesson.progress[0].timeSpent : 0,
        })),
      })),
    };
  }
}
