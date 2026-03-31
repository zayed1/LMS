import { IsNotEmpty, IsString, IsOptional, IsUUID, IsInt, IsBoolean, IsNumber, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateQuizDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'اختبار الوحدة الأولى' })
  @IsString()
  @IsNotEmpty()
  titleAr: string;

  @ApiProperty({ example: 'Module 1 Quiz' })
  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ default: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  passingScore?: number;

  @ApiPropertyOptional({ default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showResults?: boolean;
}

export class UpdateQuizDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  passingScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showResults?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @ApiPropertyOptional({ enum: QuestionType, default: QuestionType.MULTIPLE_CHOICE })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @ApiProperty({ example: 'ما هو البروتوكول المستخدم لنقل صفحات الويب؟' })
  @IsString()
  @IsNotEmpty()
  questionAr: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionEn?: string;

  @ApiPropertyOptional({ description: 'Array of { id, textAr, textEn, isCorrect }' })
  @IsOptional()
  options?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class SubmitQuizDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({ description: 'Array of { questionId, answer }' })
  @IsArray()
  answers: { questionId: string; answer: string }[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  timeSpent?: number;
}
