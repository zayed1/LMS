import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateTemplateDto, IssueCertificateDto } from './dto/create-certificate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // Templates
  @Get('templates')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'قوالب الشهادات' })
  getTemplates() { return this.certificatesService.getTemplates(); }

  @Post('templates')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'إنشاء قالب شهادة' })
  createTemplate(@Body() dto: CreateTemplateDto) { return this.certificatesService.createTemplate(dto); }

  @Patch('templates/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateTemplate(@Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) { return this.certificatesService.updateTemplate(id, dto); }

  @Delete('templates/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  deleteTemplate(@Param('id') id: string) { return this.certificatesService.deleteTemplate(id); }

  // Certificates
  @Post('issue')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'إصدار شهادة' })
  issue(@Body() dto: IssueCertificateDto) { return this.certificatesService.issueCertificate(dto); }

  @Get('all')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'جميع الشهادات' })
  getAll() { return this.certificatesService.getAllCertificates(); }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'حذف شهادة' })
  delete(@Param('id') id: string) { return this.certificatesService.deleteCertificate(id); }

  @Get('my')
  @ApiOperation({ summary: 'شهاداتي' })
  my(@CurrentUser() user: any) { return this.certificatesService.getMyCertificates(user.id); }

  @Get('verify/:certificateNo')
  @ApiOperation({ summary: 'التحقق من شهادة' })
  verify(@Param('certificateNo') no: string) { return this.certificatesService.verifyCertificate(no); }

  @Get('course/:courseId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINING_MANAGER', 'INSTRUCTOR')
  @ApiOperation({ summary: 'شهادات الدورة' })
  byCourse(@Param('courseId') id: string) { return this.certificatesService.getCourseCertificates(id); }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل شهادة' })
  findById(@Param('id') id: string) { return this.certificatesService.getCertificateById(id); }
}
