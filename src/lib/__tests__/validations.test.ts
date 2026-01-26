import { z } from 'zod';
import {
  LeadershipTypeSchema,
  FollowershipTypeSchema,
  CompatibilitySchema,
  QuestionSchema,
  ConcernSchema,
  SolutionSchema,
  SolutionActionSchema,
  ContentCreateSchema,
  ContentUpdateSchema,
  ContentQuerySchema,
  ContentDeleteSchema,
  formatZodError,
  getZodErrorDetails,
} from '../validations';

describe('validation schemas', () => {
  describe('LeadershipTypeSchema', () => {
    it('should validate valid leadership type', () => {
      const validData = {
        code: 'L01',
        name: '리더십 유형',
        title: '리더십 타이틀',
        description: '리더십 설명',
        strengths: ['강점 1', '강점 2'],
        challenges: ['도전 과제 1'],
      };

      const result = LeadershipTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid code format', () => {
      const invalidData = {
        code: 'INVALID',
        name: '리더십 유형',
        title: '리더십 타이틀',
        description: '리더십 설명',
        strengths: ['강점 1'],
        challenges: ['도전 과제 1'],
      };

      const result = LeadershipTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('L01~L99');
      }
    });

    it('should require at least one strength', () => {
      const invalidData = {
        code: 'L01',
        name: '리더십 유형',
        title: '리더십 타이틀',
        description: '리더십 설명',
        strengths: [],
        challenges: ['도전 과제 1'],
      };

      const result = LeadershipTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const validData = {
        code: 'L01',
        name: '리더십 유형',
        title: '리더십 타이틀',
        description: '리더십 설명',
        strengths: ['강점 1'],
        challenges: ['도전 과제 1'],
        image: '/images/leader.png',
        sortOrder: 1,
        isActive: true,
      };

      const result = LeadershipTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('FollowershipTypeSchema', () => {
    it('should validate valid followership type', () => {
      const validData = {
        code: 'F01',
        name: '팔로워십 유형',
        title: '팔로워십 타이틀',
        description: '팔로워십 설명',
      };

      const result = FollowershipTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid code format', () => {
      const invalidData = {
        code: 'L01',
        name: '팔로워십 유형',
        title: '팔로워십 타이틀',
        description: '팔로워십 설명',
      };

      const result = FollowershipTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CompatibilitySchema', () => {
    it('should validate valid compatibility data', () => {
      const validData = {
        leaderType: 'L01',
        followerType: 'F01',
        strengths: ['강점 1', '강점 2'],
        cautions: ['주의점 1'],
        tips: ['팁 1'],
      };

      const result = CompatibilitySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require valid leader and follower types', () => {
      const invalidData = {
        leaderType: 'INVALID',
        followerType: 'F01',
        strengths: ['강점 1'],
        cautions: ['주의점 1'],
      };

      const result = CompatibilitySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default empty tips array', () => {
      const validData = {
        leaderType: 'L01',
        followerType: 'F01',
        strengths: ['강점 1'],
        cautions: ['주의점 1'],
      };

      const result = CompatibilitySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tips).toEqual([]);
      }
    });
  });

  describe('QuestionSchema', () => {
    it('should validate valid question', () => {
      const validData = {
        code: 'Q01',
        text: '문항 내용입니다.',
        category: 'growth',
      };

      const result = QuestionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should only accept valid categories', () => {
      const invalidData = {
        code: 'Q01',
        text: '문항 내용입니다.',
        category: 'invalid',
      };

      const result = QuestionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid categories', () => {
      const categories = ['growth', 'sharing', 'interaction'];

      categories.forEach((category) => {
        const data = {
          code: 'Q01',
          text: '문항 내용입니다.',
          category,
        };

        const result = QuestionSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('ConcernSchema', () => {
    it('should validate valid concern', () => {
      const validData = {
        code: 'C01',
        label: '고민 라벨',
        categories: ['E', 'G'],
        groupName: '그룹명',
      };

      const result = ConcernSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require at least one category', () => {
      const invalidData = {
        code: 'C01',
        label: '고민 라벨',
        categories: [],
      };

      const result = ConcernSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should only accept valid category codes', () => {
      const validData = {
        code: 'C01',
        label: '고민 라벨',
        categories: ['E', 'G', 'C', 'L'],
      };

      const result = ConcernSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default empty groupName', () => {
      const validData = {
        code: 'C01',
        label: '고민 라벨',
        categories: ['E'],
      };

      const result = ConcernSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.groupName).toBe('');
      }
    });
  });

  describe('SolutionSchema', () => {
    it('should validate valid solution', () => {
      const validData = {
        code: 'P01',
        combination: 'E+G',
        title: '솔루션 타이틀',
        coreIssue: '핵심 이슈',
      };

      const result = SolutionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default empty arrays and strings', () => {
      const validData = {
        code: 'P01',
        combination: 'E+G',
        title: '솔루션 타이틀',
        coreIssue: '핵심 이슈',
      };

      const result = SolutionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fieldVoices).toEqual([]);
        expect(result.data.diagnosis).toBe('');
      }
    });
  });

  describe('SolutionActionSchema', () => {
    it('should validate valid solution action', () => {
      const validData = {
        solutionId: '123e4567-e89b-12d3-a456-426614174000',
        title: '액션 타이틀',
      };

      const result = SolutionActionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        solutionId: 'not-a-uuid',
        title: '액션 타이틀',
      };

      const result = SolutionActionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ContentCreateSchema', () => {
    it('should validate leadership creation', () => {
      const validData = {
        type: 'leadership',
        data: {
          code: 'L01',
          name: '리더십 유형',
          title: '리더십 타이틀',
          description: '리더십 설명',
          strengths: ['강점 1'],
          challenges: ['도전 과제 1'],
        },
      };

      const result = ContentCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate followership creation', () => {
      const validData = {
        type: 'followership',
        data: {
          code: 'F01',
          name: '팔로워십 유형',
          title: '팔로워십 타이틀',
          description: '팔로워십 설명',
        },
      };

      const result = ContentCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched type and data', () => {
      const invalidData = {
        type: 'leadership',
        data: {
          code: 'F01', // Followership code for leadership type
          name: '팔로워십 유형',
          title: '팔로워십 타이틀',
          description: '팔로워십 설명',
        },
      };

      const result = ContentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ContentUpdateSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        type: 'leadership',
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          name: '수정된 이름',
        },
      };

      const result = ContentUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require valid UUID', () => {
      const invalidData = {
        type: 'leadership',
        id: 'not-a-uuid',
        data: {
          name: '수정된 이름',
        },
      };

      const result = ContentUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ContentQuerySchema', () => {
    it('should validate valid content types', () => {
      const validTypes = [
        'leadership',
        'followership',
        'compatibility',
        'questions',
        'concerns',
        'solutions',
        'actions',
      ];

      validTypes.forEach((type) => {
        const result = ContentQuerySchema.safeParse({ type });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid content type', () => {
      const result = ContentQuerySchema.safeParse({ type: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('ContentDeleteSchema', () => {
    it('should validate valid delete request', () => {
      const validData = {
        type: 'leadership',
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = ContentDeleteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require both type and id', () => {
      const result1 = ContentDeleteSchema.safeParse({ type: 'leadership' });
      expect(result1.success).toBe(false);

      const result2 = ContentDeleteSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(result2.success).toBe(false);
    });
  });

  describe('formatZodError', () => {
    it('should format single error', () => {
      const schema = z.object({ name: z.string().min(1) });
      const result = schema.safeParse({ name: '' });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('name');
        expect(typeof formatted).toBe('string');
      }
    });

    it('should format multiple errors', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });
      const result = schema.safeParse({ name: '', age: -1 });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('name');
        expect(formatted).toContain('age');
      }
    });

    it('should handle nested paths', () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1),
        }),
      });
      const result = schema.safeParse({ user: { name: '' } });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('user.name');
      }
    });
  });

  describe('getZodErrorDetails', () => {
    it('should return error details by path', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });
      const result = schema.safeParse({ name: '', age: -1 });

      if (!result.success) {
        const details = getZodErrorDetails(result.error);
        expect(details.name).toBeDefined();
        expect(details.age).toBeDefined();
        expect(Array.isArray(details.name)).toBe(true);
      }
    });

    it('should group multiple errors for same path', () => {
      const schema = z.object({
        email: z.string().email().min(5),
      });
      const result = schema.safeParse({ email: 'abc' });

      if (!result.success) {
        const details = getZodErrorDetails(result.error);
        expect(details.email).toBeDefined();
        expect(Array.isArray(details.email)).toBe(true);
      }
    });

    it('should use _root for errors without path', () => {
      const schema = z.string();
      const result = schema.safeParse(123);

      if (!result.success) {
        const details = getZodErrorDetails(result.error);
        expect(details._root).toBeDefined();
      }
    });
  });
});
