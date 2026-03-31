import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, SubmitQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('course/:courseId')
  @ApiOperation({ summary: 'اختبارات الدورة' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.assessmentsService.findQuizzesByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل اختبار' })
  findById(@Param('id') id: string) {
    return this.assessmentsService.findQuizById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'إنشاء اختبار' })
  create(@Body() dto: CreateQuizDto) {
    return this.assessmentsService.createQuiz(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'تحديث اختبار' })
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.assessmentsService.updateQuiz(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'حذف اختبار' })
  delete(@Param('id') id: string) {
    return this.assessmentsService.deleteQuiz(id);
  }

  @Post('questions')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'إضافة سؤال' })
  addQuestion(@Body() dto: CreateQuestionDto) {
    return this.assessmentsService.addQuestion(dto);
  }

  @Patch('questions/:id')
  @ApiOperation({ summary: 'تحديث سؤال' })
  updateQuestion(@Param('id') id: string, @Body() dto: Partial<CreateQuestionDto>) {
    return this.assessmentsService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'حذف سؤال' })
  deleteQuestion(@Param('id') id: string) {
    return this.assessmentsService.deleteQuestion(id);
  }

  @Post('submit')
  @ApiOperation({ summary: 'تقديم إجابات الاختبار' })
  submit(@Body() dto: SubmitQuizDto, @CurrentUser() user: any) {
    return this.assessmentsService.submitQuiz(user.id, dto);
  }

  @Get(':id/my-attempts')
  @ApiOperation({ summary: 'محاولاتي في الاختبار' })
  myAttempts(@Param('id') quizId: string, @CurrentUser() user: any) {
    return this.assessmentsService.getMyAttempts(user.id, quizId);
  }

  @Get(':id/stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'إحصائيات الاختبار' })
  stats(@Param('id') quizId: string) {
    return this.assessmentsService.getQuizStats(quizId);
  }
}
