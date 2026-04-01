import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, totalCourses, publishedCourses, totalEnrollments, completedEnrollments, totalDepartments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.department.count(),
    ]);

    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    return {
      users: { total: totalUsers, active: activeUsers },
      courses: { total: totalCourses, published: publishedCourses },
      enrollments: { total: totalEnrollments, completed: completedEnrollments, completionRate },
      departments: totalDepartments,
    };
  }

  async getCourseReport(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { nameAr: true, nameEn: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { status: true, progress: true, grade: true },
    });

    const statusBreakdown = {
      enrolled: enrollments.filter(e => e.status === 'ENROLLED').length,
      inProgress: enrollments.filter(e => e.status === 'IN_PROGRESS').length,
      completed: enrollments.filter(e => e.status === 'COMPLETED').length,
      dropped: enrollments.filter(e => e.status === 'DROPPED').length,
    };

    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0;

    const quizStats = await this.prisma.quizAttempt.aggregate({
      where: { quiz: { courseId }, completedAt: { not: null } },
      _avg: { percentage: true },
      _count: true,
    });

    return { course, statusBreakdown, avgProgress, totalEnrolled: enrollments.length, quizStats };
  }

  async getUserReport(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nameAr: true, nameEn: true, email: true, role: true, department: { select: { nameAr: true } } },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: { select: { id: true, titleAr: true, titleEn: true, duration: true } } },
    });

    const certificates = await this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { titleAr: true } } },
    });

    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      select: { percentage: true, passed: true },
    });

    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / quizAttempts.length) : 0;

    return {
      user,
      enrollments: {
        total: enrollments.length,
        completed: enrollments.filter(e => e.status === 'COMPLETED').length,
        inProgress: enrollments.filter(e => e.status === 'IN_PROGRESS').length,
        avgProgress: enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0,
        courses: enrollments,
      },
      certificates: { total: certificates.length, list: certificates },
      quizzes: { totalAttempts: quizAttempts.length, avgScore: avgQuizScore, passRate: quizAttempts.length > 0 ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100) : 0 },
    };
  }

  async getEnrollmentTrends(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { enrolledAt: { gte: startDate } },
      select: { enrolledAt: true, status: true },
      orderBy: { enrolledAt: 'asc' },
    });

    const grouped: Record<string, { enrolled: number; completed: number }> = {};
    for (const e of enrollments) {
      const key = `${e.enrolledAt.getFullYear()}-${String(e.enrolledAt.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = { enrolled: 0, completed: 0 };
      grouped[key].enrolled++;
      if (e.status === 'COMPLETED') grouped[key].completed++;
    }

    return Object.entries(grouped).map(([month, data]) => ({ month, ...data }));
  }

  async getTopCourses(limit = 10) {
    const courses = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        instructor: { select: { nameAr: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
      take: limit,
    });

    return courses.map(c => ({
      id: c.id,
      titleAr: c.titleAr,
      instructor: c.instructor.nameAr,
      enrollments: c._count.enrollments,
    }));
  }

  async getRecentActivities(limit = 10) {
    // Try audit logs first, fallback to recent enrollments
    const auditLogs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, nameAr: true, nameEn: true } } },
    });

    if (auditLogs.length > 0) {
      return auditLogs.map(log => ({
        id: log.id,
        user: log.user.nameAr,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        time: log.createdAt,
      }));
    }

    // Fallback: use recent enrollments as activities
    const enrollments = await this.prisma.enrollment.findMany({
      take: limit,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { nameAr: true } },
        course: { select: { titleAr: true } },
      },
    });

    return enrollments.map(e => ({
      id: e.id,
      user: e.user.nameAr,
      action: e.status === 'COMPLETED' ? 'أكمل دورة' : 'سجل في دورة',
      entity: 'course',
      target: e.course.titleAr,
      time: e.enrolledAt,
    }));
  }

  async getDepartmentReport() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: { select: { users: true } },
        users: {
          select: {
            enrollments: { select: { status: true, progress: true } },
          },
        },
      },
    });

    return departments.map(dept => {
      const allEnrollments = dept.users.flatMap(u => u.enrollments);
      return {
        id: dept.id,
        nameAr: dept.nameAr,
        usersCount: dept._count.users,
        totalEnrollments: allEnrollments.length,
        completedEnrollments: allEnrollments.filter(e => e.status === 'COMPLETED').length,
        avgProgress: allEnrollments.length > 0 ? Math.round(allEnrollments.reduce((s, e) => s + e.progress, 0) / allEnrollments.length) : 0,
      };
    });
  }
}
