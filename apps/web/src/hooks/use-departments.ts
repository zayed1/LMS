"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface Department {
  id: string;
  nameAr: string;
  nameEn: string;
  parentId?: string;
  description?: string;
  parent?: Department;
  children?: Department[];
  _count?: { users: number };
  createdAt: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch {
      setError("حدث خطأ في تحميل الأقسام");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, isLoading, error, refetch: fetchDepartments };
}

export function useDepartmentTree() {
  const [tree, setTree] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/departments/tree").then((res) => {
      setTree(res.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return { tree, isLoading };
}

export async function createDepartment(data: Partial<Department>) {
  const res = await api.post("/departments", data);
  return res.data;
}

export async function updateDepartment(id: string, data: Partial<Department>) {
  const res = await api.patch(`/departments/${id}`, data);
  return res.data;
}

export async function deleteDepartment(id: string) {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
}
