import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto, IssueCertificateDto } from './dto/create-certificate.dto';
import * as crypto from 'crypto';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  // Templates
  async getTemplates() {
    return this.prisma.certificateTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createTemplate(dto: CreateTemplateDto) {
    if (dto.isDefault) {
      await this.prisma.certificateTemplate.updateMany({ data: { isDefault: false } });
    }
    return this.prisma.certificateTemplate.create({ data: dto });
  }

  async updateTemplate(id: string, dto: Partial<CreateTemplateDto>) {
    if (dto.isDefault) {
      await this.prisma.certificateTemplate.updateMany({ data: { isDefault: false } });
    }
    return this.prisma.certificateTemplate.update({ where: { id }, data: dto });
  }

  async deleteTemplate(id: string) {
    return this.prisma.certificateTemplate.delete({ where: { id } });
  }

  // Certificates
  async issueCertificate(dto: IssueCertificateDto) {
    const certNo = `GCDC-${new Date().getFullYear()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    let templateId = dto.templateId;
    if (!templateId) {
      const defaultTemplate = await this.prisma.certificateTemplate.findFirst({ where: { isDefault: true } });
      templateId = defaultTemplate?.id;
    }

    return this.prisma.certificate.create({
      data: {
        userId: dto.userId,
        courseId: dto.courseId,
        templateId,
        certificateNo: certNo,
        grade: dto.grade,
        pdfUrl: dto.pdfUrl,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: {
        user: { select: { id: true, nameAr: true, nameEn: true, email: true } },
        course: { select: { id: true, titleAr: true, titleEn: true } },
        template: true,
      },
    });
  }

  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, titleAr: true, titleEn: true } },
        template: { select: { id: true, nameAr: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getCertificateById(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nameAr: true, nameEn: true, email: true } },
        course: { select: { id: true, titleAr: true, titleEn: true } },
        template: true,
      },
    });
    if (!cert) throw new NotFoundException('الشهادة غير موجودة');
    return cert;
  }

  async verifyCertificate(certificateNo: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateNo },
      include: {
        user: { select: { nameAr: true, nameEn: true } },
        course: { select: { titleAr: true, titleEn: true } },
      },
    });
    if (!cert) throw new NotFoundException('الشهادة غير موجودة');
    return { valid: true, certificate: cert };
  }

  async getAllCertificates() {
    return this.prisma.certificate.findMany({
      include: {
        user: { select: { id: true, nameAr: true, nameEn: true, email: true } },
        course: { select: { id: true, titleAr: true, titleEn: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async deleteCertificate(id: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('الشهادة غير موجودة');
    return this.prisma.certificate.delete({ where: { id } });
  }

  async getCourseCertificates(courseId: string) {
    return this.prisma.certificate.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, nameAr: true, nameEn: true, email: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
