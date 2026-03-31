import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.courseCategory.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { nameAr: 'asc' },
    });
  }

  async findById(id: string) {
    const cat = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    });
    if (!cat) throw new NotFoundException('التصنيف غير موجود');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    return this.prisma.courseCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    return this.prisma.courseCategory.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.courseCategory.delete({ where: { id } });
  }
}
