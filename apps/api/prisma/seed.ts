import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-general' },
      update: {},
      create: {
        id: 'dept-general',
        nameAr: 'الإدارة العامة',
        nameEn: 'General Administration',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-training' },
      update: {},
      create: {
        id: 'dept-training',
        nameAr: 'إدارة التدريب',
        nameEn: 'Training Department',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-it' },
      update: {},
      create: {
        id: 'dept-it',
        nameAr: 'إدارة تقنية المعلومات',
        nameEn: 'Information Technology Department',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-hr' },
      update: {},
      create: {
        id: 'dept-hr',
        nameAr: 'إدارة الموارد البشرية',
        nameEn: 'Human Resources Department',
      },
    }),
  ]);

  console.log(`Created ${departments.length} departments`);

  // Create default super admin
  const hashedPassword = await bcrypt.hash('12345', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      password: hashedPassword,
      nameAr: 'مدير النظام',
      nameEn: 'System Administrator',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      departmentId: 'dept-general',
    },
  });

  console.log(`Created super admin: ${admin.email}`);
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
