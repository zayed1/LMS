export interface Department {
  id: string;
  nameAr: string;
  nameEn: string;
  parentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDepartmentDto = Omit<Department, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateDepartmentDto = Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>;
