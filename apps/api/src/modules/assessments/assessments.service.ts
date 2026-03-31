import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, SubmitQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findQuizzesByCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { attempts: true } },
      },
    });
    if (!quiz) throw new NotFoundException('الاختبار غير موجود');
    return quiz;
  }

  async createQuiz(dto: CreateQuizDto) {
    return this.prisma.quiz.create({
      data: dto,
      include: { _count: { select: { questions: true } } },
    });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    await this.findQuizById(id);
    return this.prisma.quiz.update({ where: { id }, data: dto });
  }

  async deleteQuiz(id: string) {
    await this.findQuizById(id);
    return this.prisma.quiz.delete({ where: { id } });
  }

  async addQuestion(dto: CreateQuestionDto) {
    const quiz = await this.findQuizById(dto.quizId);
    const maxSort = quiz.questions.length > 0
      ? Math.max(...quiz.questions.map(q => q.sortOrder)) + 1 : 0;

    return this.prisma.quizQuestion.create({
      data: { ...dto, sortOrder: maxSort },
    });
  }

  async updateQuestion(id: string, dto: Partial<CreateQuestionDto>) {
    return this.prisma.quizQuestion.update({ where: { id }, data: dto });
  }

  async deleteQuestion(id: string) {
    return this.prisma.quizQuestion.delete({ where: { id } });
  }

  async submitQuiz(userId: string, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('الاختبار غير موجود');
    if (!quiz.isActive) throw new BadRequestException('الاختبار غير مفعل');

    // Check max attempts
    const attemptCount = await this.prisma.quizAttempt.count({
      where: { quizId: dto.quizId, userId },
    });
    if (attemptCount >= quiz.maxAttempts) {
      throw new BadRequestException('لقد استنفذت جميع المحاولات المتاحة');
    }

    // Grade the quiz
    let score = 0;
    let totalPoints = 0;
    const gradedAnswers: any[] = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = dto.answers.find(a => a.questionId === question.id);

      let isCorrect = false;
      let earnedPoints = 0;

      if (userAnswer) {
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          const options = question.options as any[];
          if (options) {
            const correct = options.find((o: any) => o.isCorrect);
            isCorrect = correct && userAnswer.answer === correct.id;
          } else {
            isCorrect = userAnswer.answer === question.correctAnswer;
          }
        } else {
          isCorrect = userAnswer.answer?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
        }
        if (isCorrect) earnedPoints = question.points;
      }

      score += earnedPoints;
      gradedAnswers.push({
        questionId: question.id,
        answer: userAnswer?.answer || null,
        isCorrect,
        points: earnedPoints,
      });
    }

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    // Create attempt with answers
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId: dto.quizId,
        userId,
        score,
        totalPoints,
        percentage,
        passed,
        completedAt: new Date(),
        timeSpent: dto.timeSpent,
        answers: { create: gradedAnswers },
      },
      include: { answers: { include: { question: true } } },
    });

    return { attempt, passed, percentage, score, totalPoints };
  }

  async getMyAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      include: { answers: { include: { question: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getQuizStats(quizId: string) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId, completedAt: { not: null } },
      select: { percentage: true, passed: true, timeSpent: true },
    });

    const total = attempts.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const avgScore = total > 0 ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / total) : 0;
    const avgTime = total > 0 ? Math.round(attempts.reduce((s, a) => s + (a.timeSpent || 0), 0) / total) : 0;

    return { total, passedCount, failedCount: total - passedCount, passRate: total > 0 ? Math.round((passedCount / total) * 100) : 0, avgScore, avgTime };
  }
}
