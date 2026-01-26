import { z } from 'zod';

/**
 * Admin API 입력 검증 스키마
 */

// 공통 타입
const ContentType = z.enum([
  'leadership',
  'followership',
  'compatibility',
  'questions',
  'concerns',
  'solutions',
  'actions',
]);

// 리더십 유형
export const LeadershipTypeSchema = z.object({
  code: z
    .string()
    .min(1, '유형 코드는 필수입니다')
    .max(10, '유형 코드는 10자 이내여야 합니다')
    .regex(/^L\d{2}$/, '유형 코드는 L01~L99 형식이어야 합니다'),
  name: z
    .string()
    .min(1, '유형명은 필수입니다')
    .max(100, '유형명은 100자 이내여야 합니다'),
  title: z
    .string()
    .min(1, '타이틀은 필수입니다')
    .max(200, '타이틀은 200자 이내여야 합니다'),
  description: z
    .string()
    .min(1, '설명은 필수입니다')
    .max(5000, '설명은 5000자 이내여야 합니다'),
  strengths: z
    .array(z.string().max(500, '강점 항목은 500자 이내여야 합니다'))
    .min(1, '강점은 최소 1개 이상이어야 합니다')
    .max(20, '강점은 최대 20개까지 가능합니다'),
  challenges: z
    .array(z.string().max(500, '도전 과제 항목은 500자 이내여야 합니다'))
    .min(1, '도전 과제는 최소 1개 이상이어야 합니다')
    .max(20, '도전 과제는 최대 20개까지 가능합니다'),
  image: z.string().max(500, '이미지 경로는 500자 이내여야 합니다').optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// 팔로워십 유형
export const FollowershipTypeSchema = z.object({
  code: z
    .string()
    .min(1, '유형 코드는 필수입니다')
    .max(10, '유형 코드는 10자 이내여야 합니다')
    .regex(/^F\d{2}$/, '유형 코드는 F01~F99 형식이어야 합니다'),
  name: z
    .string()
    .min(1, '유형명은 필수입니다')
    .max(100, '유형명은 100자 이내여야 합니다'),
  title: z
    .string()
    .min(1, '타이틀은 필수입니다')
    .max(200, '타이틀은 200자 이내여야 합니다'),
  description: z
    .string()
    .min(1, '설명은 필수입니다')
    .max(5000, '설명은 5000자 이내여야 합니다'),
  icon: z
    .string()
    .max(10, '아이콘은 10자 이내여야 합니다')
    .optional()
    .nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// 궁합
export const CompatibilitySchema = z.object({
  leaderType: z
    .string()
    .min(1, '리더십 유형은 필수입니다')
    .regex(/^L\d{2}$/, '리더십 유형은 L01~L99 형식이어야 합니다'),
  followerType: z
    .string()
    .min(1, '팔로워십 유형은 필수입니다')
    .regex(/^F\d{2}$/, '팔로워십 유형은 F01~F99 형식이어야 합니다'),
  strengths: z
    .array(z.string().max(1000, '강점 항목은 1000자 이내여야 합니다'))
    .min(1, '강점은 최소 1개 이상이어야 합니다')
    .max(10, '강점은 최대 10개까지 가능합니다'),
  cautions: z
    .array(z.string().max(1000, '주의점 항목은 1000자 이내여야 합니다'))
    .min(1, '주의점은 최소 1개 이상이어야 합니다')
    .max(10, '주의점은 최대 10개까지 가능합니다'),
  tips: z
    .array(z.string().max(1000, '코칭 팁 항목은 1000자 이내여야 합니다'))
    .max(10, '코칭 팁은 최대 10개까지 가능합니다')
    .default([]),
});

// 문항
export const QuestionSchema = z.object({
  code: z
    .string()
    .min(1, '문항 코드는 필수입니다')
    .max(10, '문항 코드는 10자 이내여야 합니다')
    .regex(/^Q\d{2}$/, '문항 코드는 Q01~Q99 형식이어야 합니다'),
  text: z
    .string()
    .min(1, '문항 내용은 필수입니다')
    .max(1000, '문항 내용은 1000자 이내여야 합니다'),
  category: z.enum(['growth', 'sharing', 'interaction'], {
    error: '카테고리는 growth, sharing, interaction 중 하나여야 합니다',
  }),
  subcategory: z.string().max(100, '하위 카테고리는 100자 이내여야 합니다').optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// 고민 키워드
export const ConcernSchema = z.object({
  code: z
    .string()
    .min(1, '고민 코드는 필수입니다')
    .max(10, '고민 코드는 10자 이내여야 합니다')
    .regex(/^C\d{2}$/, '고민 코드는 C01~C99 형식이어야 합니다'),
  label: z
    .string()
    .min(1, '라벨은 필수입니다')
    .max(200, '라벨은 200자 이내여야 합니다'),
  categories: z
    .array(z.enum(['E', 'G', 'C', 'L']))
    .min(1, '카테고리는 최소 1개 이상이어야 합니다')
    .max(4, '카테고리는 최대 4개까지 가능합니다'),
  groupName: z.string().max(100, '그룹명은 100자 이내여야 합니다').default(''),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// 솔루션
export const SolutionSchema = z.object({
  code: z
    .string()
    .min(1, '솔루션 코드는 필수입니다')
    .max(10, '솔루션 코드는 10자 이내여야 합니다')
    .regex(/^P\d{2}$/, '솔루션 코드는 P01~P99 형식이어야 합니다'),
  combination: z
    .string()
    .min(1, '조합명은 필수입니다')
    .max(20, '조합명은 20자 이내여야 합니다'),
  title: z
    .string()
    .min(1, '타이틀은 필수입니다')
    .max(200, '타이틀은 200자 이내여야 합니다'),
  coreIssue: z
    .string()
    .min(1, '핵심 이슈는 필수입니다')
    .max(500, '핵심 이슈는 500자 이내여야 합니다'),
  fieldVoices: z
    .array(z.string().max(500, '현장 목소리 항목은 500자 이내여야 합니다'))
    .max(10, '현장 목소리는 최대 10개까지 가능합니다')
    .default([]),
  diagnosis: z
    .string()
    .max(2000, '진단은 2000자 이내여야 합니다')
    .default(''),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// 솔루션 액션
export const SolutionActionSchema = z.object({
  solutionId: z.string().uuid('솔루션 ID는 유효한 UUID여야 합니다'),
  title: z
    .string()
    .min(1, '타이틀은 필수입니다')
    .max(200, '타이틀은 200자 이내여야 합니다'),
  method: z
    .string()
    .max(2000, '방법은 2000자 이내여야 합니다')
    .default(''),
  effect: z
    .string()
    .max(1000, '효과는 1000자 이내여야 합니다')
    .default(''),
  leadershipTip: z
    .string()
    .max(1000, '리더십 팁은 1000자 이내여야 합니다')
    .default(''),
  sortOrder: z.number().int().min(0).optional(),
});

// POST 요청 스키마
export const ContentCreateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('leadership'), data: LeadershipTypeSchema }),
  z.object({ type: z.literal('followership'), data: FollowershipTypeSchema }),
  z.object({ type: z.literal('compatibility'), data: CompatibilitySchema }),
  z.object({ type: z.literal('questions'), data: QuestionSchema }),
  z.object({ type: z.literal('concerns'), data: ConcernSchema }),
  z.object({ type: z.literal('solutions'), data: SolutionSchema }),
  z.object({ type: z.literal('actions'), data: SolutionActionSchema }),
]);

// PUT 요청 스키마 (id 포함, data는 partial)
export const ContentUpdateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('leadership'), id: z.string().uuid(), data: LeadershipTypeSchema.partial() }),
  z.object({ type: z.literal('followership'), id: z.string().uuid(), data: FollowershipTypeSchema.partial() }),
  z.object({ type: z.literal('compatibility'), id: z.string().uuid(), data: CompatibilitySchema.partial() }),
  z.object({ type: z.literal('questions'), id: z.string().uuid(), data: QuestionSchema.partial() }),
  z.object({ type: z.literal('concerns'), id: z.string().uuid(), data: ConcernSchema.partial() }),
  z.object({ type: z.literal('solutions'), id: z.string().uuid(), data: SolutionSchema.partial() }),
  z.object({ type: z.literal('actions'), id: z.string().uuid(), data: SolutionActionSchema.partial() }),
]);

// GET 요청 쿼리 스키마
export const ContentQuerySchema = z.object({
  type: ContentType,
});

// DELETE 요청 쿼리 스키마
export const ContentDeleteSchema = z.object({
  type: ContentType,
  id: z.string().uuid('ID는 유효한 UUID여야 합니다'),
});

/**
 * Zod 에러를 사용자 친화적 메시지로 변환
 */
export function formatZodError(error: z.ZodError): string {
  const issues = error.issues || [];
  const messages = issues.map((e: z.ZodIssue) => {
    const path = e.path.join('.');
    return path ? `${path}: ${e.message}` : e.message;
  });
  return messages.join(', ');
}

/**
 * Zod 에러를 상세 객체로 변환
 */
export function getZodErrorDetails(error: z.ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  const issues = error.issues || [];
  issues.forEach((e: z.ZodIssue) => {
    const path = e.path.join('.') || '_root';
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(e.message);
  });
  return details;
}
