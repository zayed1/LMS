"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface User {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  role: string;
  status: string;
  departmentId?: string;
  department?: { id: string; nameAr: string; nameEn: string };
  phone?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  departmentId?: string;
}

export function useUsers(params: UseUsersParams = {}) {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
      if (params.search) query.set("search", params.search);
      if (params.role) query.set("role", params.role);
      if (params.status) query.set("status", params.status);
      if (params.departmentId) query.set("departmentId", params.departmentId);

      const res = await api.get(`/users?${query.toString()}`);
      setData(res.data);
    } catch {
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.search, params.role, params.status, params.departmentId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, isLoading, error, refetch: fetchUsers };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/users/${id}`).then((res) => {
      setUser(res.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [id]);

  return { user, isLoading };
}

export async function createUser(data: Partial<User> & { password?: string }) {
  const res = await api.post("/users", data);
  return res.data;
}

export async function updateUser(id: string, data: Partial<User>) {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function importUsersCSV(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/users/import-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
