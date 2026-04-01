"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCourseProgress, updateLessonProgress } from "@/hooks/use-courses";
import { ChevronDown, ChevronLeft, Check, Play, FileText, Video, BookOpen, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { toast } from "@/lib/toast";

const typeIcons: Record<string, any> = {
  TEXT: FileText, VIDEO: Video, DOCUMENT: FileText, QUIZ: BookOpen,
  ASSIGNMENT: FileText, LIVE_SESSION: Play, SCORM: BookOpen,
};

export default function LearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { progress, isLoading, refetch } = useCourseProgress(courseId);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);

  // Build flat lesson list for navigation
  const allLessons: any[] = [];
  progress?.modules?.forEach((mod: any) => {
    mod.lessons?.forEach((l: any) => allLessons.push({ ...l, moduleTitleAr: mod.titleAr }));
  });

  // Auto-select first incomplete or first lesson
  useEffect(() => {
    if (!currentLessonId && allLessons.length > 0) {
      const firstIncomplete = allLessons.find(l => !l.completed);
      setCurrentLessonId(firstIncomplete?.id || allLessons[0].id);
    }
    // Expand all modules initially
    if (progress?.modules) {
      setExpandedModules(new Set(progress.modules.map((m: any) => m.id)));
    }
  }, [progress]);

  const currentLesson = allLessons.find(l => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!currentLessonId) return;
    setCompleting(true);
    try {
      await updateLessonProgress(currentLessonId, { completed: true });
      refetch();
      if (nextLesson) setCurrentLessonId(nextLesson.id);
    } catch { toast.error("حدث خطأ في تحديث التقدم"); }
    finally { setCompleting(false); }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!progress) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">لم يتم العثور على بيانات التقدم</p>
        <p className="text-gray-400 text-sm mb-4">قد تحتاج للتسجيل في الدورة أولاً</p>
        <a href="/catalog" className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">تصفح الدورات</a>
      </div>
    );
  }

  const courseProgress = progress.enrollment?.progress || 0;

  return (
    <div className="flex gap-6 min-h-[calc(100vh-180px)]">
      {/* Sidebar - Course Outline */}
      <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Progress Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">التقدم الكلي</span>
            <span className="text-primary font-bold">{Math.round(courseProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${courseProgress}%` }} />
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto">
          {progress.modules?.map((mod: any) => (
            <div key={mod.id}>
              <button onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">
                {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
                <span className="flex-1 text-right">{mod.titleAr}</span>
              </button>
              {expandedModules.has(mod.id) && mod.lessons?.map((lesson: any) => {
                const Icon = typeIcons[lesson.type] || FileText;
                const isActive = lesson.id === currentLessonId;
                return (
                  <button key={lesson.id} onClick={() => setCurrentLessonId(lesson.id)}
                    className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                      isActive ? "bg-primary/5 text-primary border-r-2 border-primary" : "text-gray-600 hover:bg-gray-50"
                    }`}>
                    {lesson.completed ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="flex-1 text-right line-clamp-1">{lesson.titleAr}</span>
                    {lesson.duration && <span className="text-xs text-gray-400">{lesson.duration}د</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentLesson ? (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-8 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span>{currentLesson.moduleTitleAr}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">{currentLesson.titleAr}</h1>

              {/* Content based on type */}
              {currentLesson.type === "VIDEO" && (
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <Play className="w-16 h-16 text-white/50" />
                </div>
              )}

              {(currentLesson.type === "TEXT" || currentLesson.type === "QUIZ" || currentLesson.type === "ASSIGNMENT") && currentLesson.content && (
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {currentLesson.content}
                </div>
              )}

              {currentLesson.type === "DOCUMENT" && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">مستند للتحميل</p>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mt-4 flex items-center justify-between">
              <button disabled={!prevLesson} onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-30">
                <ArrowRight className="w-4 h-4" /> الدرس السابق
              </button>

              {!currentLesson.completed ? (
                <button onClick={handleComplete} disabled={completing}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  <Check className="w-4 h-4" /> {completing ? "جاري..." : "إكمال الدرس"}
                </button>
              ) : (
                <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Check className="w-4 h-4" /> مكتمل
                </span>
              )}

              <button disabled={!nextLesson} onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-30">
                الدرس التالي <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex-1 flex items-center justify-center">
            <div>
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد دروس في هذه الدورة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
