import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة الدورات' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('modality') modality?: string,
    @Query('categoryId') categoryId?: string,
    @Query('instructorId') instructorId?: string,
  ) {
    return this.coursesService.findAll(pagination, { status, modality, categoryId, instructorId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل دورة' })
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'إنشاء دورة جديدة' })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'تحديث دورة' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'حذف دورة' })
  delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }

  @Post(':id/publish')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'نشر دورة' })
  publish(@Param('id') id: string) {
    return this.coursesService.publish(id);
  }

  @Post(':id/archive')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'أرشفة دورة' })
  archive(@Param('id') id: string) {
    return this.coursesService.archive(id);
  }

  // Module endpoints
  @Post(':id/modules')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'إضافة وحدة' })
  addModule(@Param('id') courseId: string, @Body() dto: CreateModuleDto) {
    dto.courseId = courseId;
    return this.coursesService.addModule(dto);
  }

  @Patch('modules/:moduleId')
  @ApiOperation({ summary: 'تحديث وحدة' })
  updateModule(@Param('moduleId') id: string, @Body() dto: UpdateModuleDto) {
    return this.coursesService.updateModule(id, dto);
  }

  @Delete('modules/:moduleId')
  @ApiOperation({ summary: 'حذف وحدة' })
  deleteModule(@Param('moduleId') id: string) {
    return this.coursesService.deleteModule(id);
  }

  // Lesson endpoints
  @Post('modules/:moduleId/lessons')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'إضافة درس' })
  addLesson(@Param('moduleId') moduleId: string, @Body() dto: CreateLessonDto) {
    dto.moduleId = moduleId;
    return this.coursesService.addLesson(dto);
  }

  @Patch('lessons/:lessonId')
  @ApiOperation({ summary: 'تحديث درس' })
  updateLesson(@Param('lessonId') id: string, @Body() dto: UpdateLessonDto) {
    return this.coursesService.updateLesson(id, dto);
  }

  @Delete('lessons/:lessonId')
  @ApiOperation({ summary: 'حذف درس' })
  deleteLesson(@Param('lessonId') id: string) {
    return this.coursesService.deleteLesson(id);
  }

  // Reordering
  @Put(':id/reorder-modules')
  @ApiOperation({ summary: 'إعادة ترتيب الوحدات' })
  reorderModules(@Param('id') courseId: string, @Body('moduleIds') moduleIds: string[]) {
    return this.coursesService.reorderModules(courseId, moduleIds);
  }

  @Put('modules/:moduleId/reorder-lessons')
  @ApiOperation({ summary: 'إعادة ترتيب الدروس' })
  reorderLessons(@Param('moduleId') moduleId: string, @Body('lessonIds') lessonIds: string[]) {
    return this.coursesService.reorderLessons(moduleId, lessonIds);
  }
}
