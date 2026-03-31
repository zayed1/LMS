"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  thumbnail?: string;
  status: string;
  modality: string;
  instructorId: string;
  instructor?: { id: string; nameAr: string; nameEn: string };
  categoryId?: string;
  category?: { id: string; nameAr: string; nameEn: string };
  duration?: number;
  maxEnrollment?: number;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  _count?: { modules: number; enrollments: number };
  modules?: CourseModule[];
  createdAt: string;
}

export interface CourseModule {
  id: string;
  titleAr: string;
  titleEn: string;
  description?: string;
  sortOrder: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  type: string;
  content?: string;
  videoUrl?: string;
  fileUrl?: string;
  duration?: number;
  sortOrder: number;
  isPreview: boolean;
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: Course;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  icon?: string;
  color?: string;
  _count?: { courses: number };
}

interface CoursesResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  modality?: string;
  categoryId?: string;
}

export function useCourses(params: UseCoursesParams = {}) {
  const [data, setData] = useState<CoursesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
      if (params.search) query.set("search", params.search);
      if (params.status) query.set("status", params.status);
      if (params.modality) query.set("modality", params.modality);
      if (params.categoryId) query.set("categoryId", params.categoryId);
      const res = await api.get(`/courses?${query.toString()}`);
      setData(res.data);
    } catch {
      setError("حدث خطأ في تحميل الدورات");
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.search, params.status, params.modality, params.categoryId]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { data, isLoading, error, refetch: fetchCourses };
}

export function useCourse(id: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  return { course, isLoading, refetch: fetchCourse };
}

export async function createCourse(data: Partial<Course>) {
  const res = await api.post("/courses", data);
  return res.data;
}

export async function updateCourse(id: string, data: Partial<Course>) {
  const res = await api.patch(`/courses/${id}`, data);
  return res.data;
}

export async function deleteCourse(id: string) {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
}

export async function publishCourse(id: string) {
  const res = await api.post(`/courses/${id}/publish`);
  return res.data;
}

export async function archiveCourse(id: string) {
  const res = await api.post(`/courses/${id}/archive`);
  return res.data;
}

// Modules
export async function addModule(courseId: string, data: { titleAr: string; titleEn: string; description?: string }) {
  const res = await api.post(`/courses/${courseId}/modules`, data);
  return res.data;
}

export async function updateModule(id: string, data: Partial<CourseModule>) {
  const res = await api.patch(`/courses/modules/${id}`, data);
  return res.data;
}

export async function deleteModule(id: string) {
  const res = await api.delete(`/courses/modules/${id}`);
  return res.data;
}

// Lessons
export async function addLesson(moduleId: string, data: Partial<Lesson>) {
  const res = await api.post(`/courses/modules/${moduleId}/lessons`, data);
  return res.data;
}

export async function updateLesson(id: string, data: Partial<Lesson>) {
  const res = await api.patch(`/courses/lessons/${id}`, data);
  return res.data;
}

export async function deleteLesson(id: string) {
  const res = await api.delete(`/courses/lessons/${id}`);
  return res.data;
}

// Enrollments
export async function enrollInCourse(courseId: string) {
  const res = await api.post("/enrollments", { courseId });
  return res.data;
}

export async function unenrollFromCourse(courseId: string) {
  const res = await api.delete(`/enrollments/${courseId}`);
  return res.data;
}

export function useMyEnrollments(status?: string) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = status ? `?status=${status}` : "";
      const res = await api.get(`/enrollments/my${query}`);
      setEnrollments(res.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { enrollments, isLoading, refetch: fetch };
}

export async function updateLessonProgress(lessonId: string, data: { completed?: boolean; timeSpent?: number }) {
  const res = await api.post("/enrollments/progress", { lessonId, ...data });
  return res.data;
}

export function useCourseProgress(courseId: string) {
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/enrollments/progress/${courseId}`);
      setProgress(res.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, [courseId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { progress, isLoading, refetch: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then(res => {
      setCategories(res.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}
