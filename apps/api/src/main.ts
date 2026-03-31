import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';

async function seedAdmin() {
  const logger = new Logger('Seed');
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@gcdc.gov.sa' } });
    if (!admin) {
      await prisma.department.upsert({
        where: { id: 'dept-general' },
        update: {},
        create: { id: 'dept-general', nameAr: 'الإدارة العامة', nameEn: 'General Administration' },
      });
      const hash = await bcrypt.hash('Admin@123', 12);
      await prisma.user.create({
        data: { email: 'admin@gcdc.gov.sa', password: hash, nameAr: 'مدير النظام', nameEn: 'System Admin', role: 'SUPER_ADMIN', status: 'ACTIVE', departmentId: 'dept-general' },
      });
      logger.log('Admin account created: admin@gcdc.gov.sa');
    }
  } catch (e) {
    logger.warn('Seed skipped (DB may not be ready yet)');
  } finally {
    await prisma.$disconnect();
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seed admin after app starts (DB available at runtime)
  seedAdmin().catch(() => {});

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('المركز الخليجي للوقاية من الأمراض ومكافحتها - LMS API')
    .setDescription('نظام إدارة التعلم - المركز الخليجي للوقاية من الأمراض ومكافحتها')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`LMS API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
