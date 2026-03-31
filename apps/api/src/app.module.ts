import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    CoursesModule,
    EnrollmentsModule,
    CategoriesModule,
    AssessmentsModule,
    CertificatesModule,
    NotificationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
