import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'إحصائيات لوحة التحكم' })
  dashboard() { return this.reportsService.getDashboardStats(); }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'تقرير دورة' })
  course(@Param('courseId') id: string) { return this.reportsService.getCourseReport(id); }

  @Get('user/:userId')
  @ApiOperation({ summary: 'تقرير متعلم' })
  user(@Param('userId') id: string) { return this.reportsService.getUserReport(id); }

  @Get('enrollment-trends')
  @ApiOperation({ summary: 'اتجاهات التسجيل' })
  trends(@Query('months') months?: string) { return this.reportsService.getEnrollmentTrends(Number(months) || 6); }

  @Get('top-courses')
  @ApiOperation({ summary: 'أعلى الدورات' })
  topCourses(@Query('limit') limit?: string) { return this.reportsService.getTopCourses(Number(limit) || 10); }

  @Get('departments')
  @ApiOperation({ summary: 'تقرير الأقسام' })
  departments() { return this.reportsService.getDepartmentReport(); }

  @Get('recent-activities')
  @ApiOperation({ summary: 'آخر النشاطات' })
  recentActivities(@Query('limit') limit?: string) { return this.reportsService.getRecentActivities(Number(limit) || 10); }
}
