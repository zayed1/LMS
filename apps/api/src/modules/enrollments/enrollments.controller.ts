import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { UpdateLessonProgressDto } from './dto/update-progress.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'التسجيل في دورة' })
  enroll(@Body() dto: EnrollDto, @CurrentUser() user: any) {
    const userId = dto.userId || user.id;
    return this.enrollmentsService.enroll(dto.courseId, userId);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'إلغاء التسجيل' })
  unenroll(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.enrollmentsService.unenroll(courseId, user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'دوراتي' })
  getMyEnrollments(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.enrollmentsService.getMyEnrollments(user.id, status);
  }

  @Get('course/:courseId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'متدربي الدورة' })
  getCourseEnrollments(@Param('courseId') courseId: string, @Query() pagination: PaginationDto) {
    return this.enrollmentsService.getCourseEnrollments(courseId, pagination);
  }

  @Post('progress')
  @ApiOperation({ summary: 'تحديث تقدم الدرس' })
  updateProgress(@Body() dto: UpdateLessonProgressDto, @CurrentUser() user: any) {
    return this.enrollmentsService.updateLessonProgress(user.id, dto.lessonId, dto);
  }

  @Get('progress/:courseId')
  @ApiOperation({ summary: 'تقدمي في الدورة' })
  getMyCourseProgress(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.enrollmentsService.getMyCourseProgress(user.id, courseId);
  }
}
