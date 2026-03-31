import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        parent: { select: { id: true, nameAr: true, nameEn: true } },
        children: { select: { id: true, nameAr: true, nameEn: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, nameAr: true, nameEn: true } },
        children: { select: { id: true, nameAr: true, nameEn: true } },
        _count: { select: { users: true } },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    return department;
  }

  async create(dto: CreateDepartmentDto) {
    if (dto.parentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent department with ID "${dto.parentId}" not found`,
        );
      }
    }

    return this.prisma.department.create({
      data: dto,
      include: {
        parent: { select: { id: true, nameAr: true, nameEn: true } },
      },
    });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findById(id);

    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: {
        parent: { select: { id: true, nameAr: true, nameEn: true } },
        children: { select: { id: true, nameAr: true, nameEn: true } },
      },
    });
  }

  async delete(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { users: true, children: true } } },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    if (department._count.users > 0) {
      throw new ConflictException(
        `Cannot delete department with ${department._count.users} assigned user(s). Reassign users first.`,
      );
    }

    if (department._count.children > 0) {
      throw new ConflictException(
        `Cannot delete department with ${department._count.children} child department(s). Remove children first.`,
      );
    }

    return this.prisma.department.delete({ where: { id } });
  }

  async getTree() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const dept of departments) {
      map.set(dept.id, { ...dept, children: [] });
    }

    for (const dept of departments) {
      const node = map.get(dept.id);
      if (dept.parentId && map.has(dept.parentId)) {
        map.get(dept.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
