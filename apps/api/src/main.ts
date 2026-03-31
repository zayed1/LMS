import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('Database migrations complete.');
  } catch (e) {
    console.warn('Migration warning:', (e as Error).message);
  }
}

async function seedDatabase() {
  const prisma = new PrismaClient();
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@gcdc.gov.sa' } });
    if (!adminExists) {
      console.log('Seeding database...');

      await prisma.department.upsert({
        where: { id: 'dept-general' },
        update: {},
        create: { id: 'dept-general', nameAr: 'الإدارة العامة', nameEn: 'General Administration' },
      });

      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      await prisma.user.create({
        data: {
          email: 'admin@gcdc.gov.sa',
          password: hashedPassword,
          nameAr: 'مدير النظام',
          nameEn: 'System Administrator',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          departmentId: 'dept-general',
        },
      });
      console.log('Admin account created: admin@gcdc.gov.sa');
    }
  } catch (e) {
    console.warn('Seed warning:', (e as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

async function bootstrap() {
  await runMigrations();
  await seedDatabase();

  const app = await NestFactory.create(AppModule);

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
