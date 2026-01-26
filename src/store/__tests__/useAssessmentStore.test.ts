import { renderHook, act } from '@testing-library/react';
import { useAssessmentStore } from '../useAssessmentStore';

// Mock crypto.randomUUID for Node.js environment
const mockUUID = 'test-uuid-12345';
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => mockUUID),
  },
});

describe('useAssessmentStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { getState } = useAssessmentStore;
    act(() => {
      getState().reset();
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAssessmentStore());

      expect(result.current.nickname).toBe('');
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.answers).toEqual({});
      expect(result.current.selectedConcerns).toEqual([]);
      expect(result.current.company).toBe('');
      expect(result.current.department).toBe('');
      expect(result.current.jobRole).toBe('');
      expect(result.current.email).toBe('');
      expect(result.current.agreedToTerms).toBe(false);
      expect(result.current.scores).toBeNull();
      expect(result.current.leadershipType).toBeNull();
      expect(result.current.teamMembers).toEqual([]);
      expect(result.current.assessmentId).toBeNull();
    });
  });

  describe('nickname', () => {
    it('should set nickname', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setNickname('테스트유저');
      });

      expect(result.current.nickname).toBe('테스트유저');
    });

    it('should update nickname', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setNickname('첫번째');
      });
      expect(result.current.nickname).toBe('첫번째');

      act(() => {
        result.current.setNickname('두번째');
      });
      expect(result.current.nickname).toBe('두번째');
    });
  });

  describe('answers', () => {
    it('should set answer for a question', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(1, 5);
      });

      expect(result.current.answers).toEqual({ 1: 5 });
    });

    it('should set multiple answers', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(1, 5);
        result.current.setAnswer(2, 3);
        result.current.setAnswer(3, 4);
      });

      expect(result.current.answers).toEqual({ 1: 5, 2: 3, 3: 4 });
    });

    it('should update existing answer', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(1, 5);
      });
      expect(result.current.answers[1]).toBe(5);

      act(() => {
        result.current.setAnswer(1, 3);
      });
      expect(result.current.answers[1]).toBe(3);
    });
  });

  describe('question navigation', () => {
    it('should go to next question', () => {
      const { result } = renderHook(() => useAssessmentStore());

      expect(result.current.currentQuestionIndex).toBe(0);

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should go to previous question', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setCurrentQuestionIndex(5);
      });

      act(() => {
        result.current.prevQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(4);
    });

    it('should not go below 0 when going to previous question', () => {
      const { result } = renderHook(() => useAssessmentStore());

      expect(result.current.currentQuestionIndex).toBe(0);

      act(() => {
        result.current.prevQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should set current question index directly', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setCurrentQuestionIndex(10);
      });

      expect(result.current.currentQuestionIndex).toBe(10);
    });

    it('should navigate through multiple questions', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.nextQuestion();
        result.current.nextQuestion();
        result.current.nextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(3);

      act(() => {
        result.current.prevQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(2);
    });
  });

  describe('concerns', () => {
    it('should toggle concern on', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.toggleConcern('communication');
      });

      expect(result.current.selectedConcerns).toContain('communication');
    });

    it('should toggle concern off', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.toggleConcern('communication');
      });
      expect(result.current.selectedConcerns).toContain('communication');

      act(() => {
        result.current.toggleConcern('communication');
      });
      expect(result.current.selectedConcerns).not.toContain('communication');
    });

    it('should handle multiple concerns', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.toggleConcern('communication');
        result.current.toggleConcern('leadership');
        result.current.toggleConcern('teamwork');
      });

      expect(result.current.selectedConcerns).toHaveLength(3);
      expect(result.current.selectedConcerns).toContain('communication');
      expect(result.current.selectedConcerns).toContain('leadership');
      expect(result.current.selectedConcerns).toContain('teamwork');
    });

    it('should set concerns directly', () => {
      const { result } = renderHook(() => useAssessmentStore());

      const concerns = ['concern1', 'concern2', 'concern3'];
      act(() => {
        result.current.setConcerns(concerns);
      });

      expect(result.current.selectedConcerns).toEqual(concerns);
    });

    it('should replace existing concerns when setting directly', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.toggleConcern('old-concern');
      });

      act(() => {
        result.current.setConcerns(['new-concern1', 'new-concern2']);
      });

      expect(result.current.selectedConcerns).toEqual(['new-concern1', 'new-concern2']);
      expect(result.current.selectedConcerns).not.toContain('old-concern');
    });
  });

  describe('profile', () => {
    it('should set company', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({ company: '테스트회사' });
      });

      expect(result.current.company).toBe('테스트회사');
    });

    it('should set department', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({ department: '개발팀' });
      });

      expect(result.current.department).toBe('개발팀');
    });

    it('should set job role', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({ jobRole: 'CEO' });
      });

      expect(result.current.jobRole).toBe('CEO');
    });

    it('should set email', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({ email: 'test@example.com' });
      });

      expect(result.current.email).toBe('test@example.com');
    });

    it('should set agreedToTerms', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({ agreedToTerms: true });
      });

      expect(result.current.agreedToTerms).toBe(true);
    });

    it('should set multiple profile fields at once', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({
          company: '테스트회사',
          department: '개발팀',
          jobRole: 'CTO',
          email: 'test@example.com',
          agreedToTerms: true,
        });
      });

      expect(result.current.company).toBe('테스트회사');
      expect(result.current.department).toBe('개발팀');
      expect(result.current.jobRole).toBe('CTO');
      expect(result.current.email).toBe('test@example.com');
      expect(result.current.agreedToTerms).toBe(true);
    });

    it('should preserve existing profile fields when updating partial', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setProfile({
          company: '테스트회사',
          department: '개발팀',
        });
      });

      act(() => {
        result.current.setProfile({ email: 'new@example.com' });
      });

      expect(result.current.company).toBe('테스트회사');
      expect(result.current.department).toBe('개발팀');
      expect(result.current.email).toBe('new@example.com');
    });
  });

  describe('result', () => {
    it('should set result scores and leadership type', () => {
      const { result } = renderHook(() => useAssessmentStore());

      const scores = {
        vision: 80,
        execution: 75,
        empathy: 85,
        communication: 70,
        growth: 90,
      };

      act(() => {
        result.current.setResult(scores, 'visionary');
      });

      expect(result.current.scores).toEqual(scores);
      expect(result.current.leadershipType).toBe('visionary');
    });

    it('should update result', () => {
      const { result } = renderHook(() => useAssessmentStore());

      const scores1 = {
        vision: 80,
        execution: 75,
        empathy: 85,
        communication: 70,
        growth: 90,
      };

      const scores2 = {
        vision: 70,
        execution: 85,
        empathy: 75,
        communication: 80,
        growth: 70,
      };

      act(() => {
        result.current.setResult(scores1, 'visionary');
      });

      act(() => {
        result.current.setResult(scores2, 'executor');
      });

      expect(result.current.scores).toEqual(scores2);
      expect(result.current.leadershipType).toBe('executor');
    });
  });

  describe('team members', () => {
    it('should add team member', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.addTeamMember('팀원1', 'supporter');
      });

      expect(result.current.teamMembers).toHaveLength(1);
      expect(result.current.teamMembers[0]).toEqual({
        id: mockUUID,
        name: '팀원1',
        type: 'supporter',
      });
    });

    it('should add multiple team members', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.addTeamMember('팀원1', 'supporter');
        result.current.addTeamMember('팀원2', 'challenger');
        result.current.addTeamMember('팀원3', 'innovator');
      });

      expect(result.current.teamMembers).toHaveLength(3);
    });

    it('should remove team member by id', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.addTeamMember('팀원1', 'supporter');
      });

      const memberId = result.current.teamMembers[0].id;

      act(() => {
        result.current.removeTeamMember(memberId);
      });

      expect(result.current.teamMembers).toHaveLength(0);
    });

    it('should clear all team members', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.addTeamMember('팀원1', 'supporter');
        result.current.addTeamMember('팀원2', 'challenger');
      });

      expect(result.current.teamMembers).toHaveLength(2);

      act(() => {
        result.current.clearTeamMembers();
      });

      expect(result.current.teamMembers).toHaveLength(0);
    });

    it('should not remove team member with non-existent id', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.addTeamMember('팀원1', 'supporter');
      });

      act(() => {
        result.current.removeTeamMember('non-existent-id');
      });

      expect(result.current.teamMembers).toHaveLength(1);
    });
  });

  describe('assessment ID', () => {
    it('should set assessment ID', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAssessmentId('assessment-123');
      });

      expect(result.current.assessmentId).toBe('assessment-123');
    });

    it('should update assessment ID', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAssessmentId('assessment-123');
      });

      act(() => {
        result.current.setAssessmentId('assessment-456');
      });

      expect(result.current.assessmentId).toBe('assessment-456');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Set various state
      act(() => {
        result.current.setNickname('테스트유저');
        result.current.setAnswer(1, 5);
        result.current.setAnswer(2, 3);
        result.current.nextQuestion();
        result.current.toggleConcern('communication');
        result.current.setProfile({
          company: '테스트회사',
          email: 'test@example.com',
        });
        result.current.setResult(
          { vision: 80, execution: 75, empathy: 85, communication: 70, growth: 90 },
          'visionary'
        );
        result.current.addTeamMember('팀원1', 'supporter');
        result.current.setAssessmentId('assessment-123');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify all reset
      expect(result.current.nickname).toBe('');
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.answers).toEqual({});
      expect(result.current.selectedConcerns).toEqual([]);
      expect(result.current.company).toBe('');
      expect(result.current.department).toBe('');
      expect(result.current.jobRole).toBe('');
      expect(result.current.email).toBe('');
      expect(result.current.agreedToTerms).toBe(false);
      expect(result.current.scores).toBeNull();
      expect(result.current.leadershipType).toBeNull();
      expect(result.current.teamMembers).toEqual([]);
      expect(result.current.assessmentId).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should have persist middleware configured', () => {
      // Verify the store has persist middleware
      const store = useAssessmentStore;
      expect(store.persist).toBeDefined();
      expect(store.persist.getOptions().name).toBe('leadmind-assessment');
    });

    it('should partialize state correctly', () => {
      const store = useAssessmentStore;
      const partialize = store.persist.getOptions().partialize;

      if (partialize) {
        const fullState = {
          nickname: 'test',
          currentQuestionIndex: 5,
          answers: { 1: 5 },
          selectedConcerns: ['concern1'],
          company: 'company',
          department: 'dept',
          jobRole: 'CEO' as const,
          email: 'test@test.com',
          agreedToTerms: true,
          scores: { vision: 80, execution: 75, empathy: 85, communication: 70, growth: 90 },
          leadershipType: 'visionary',
          teamMembers: [{ id: '1', name: 'member', type: 'supporter' }],
          assessmentId: 'id-123',
          // Actions (not persisted)
          setNickname: jest.fn(),
          setAnswer: jest.fn(),
          nextQuestion: jest.fn(),
          prevQuestion: jest.fn(),
          setCurrentQuestionIndex: jest.fn(),
          toggleConcern: jest.fn(),
          setConcerns: jest.fn(),
          setProfile: jest.fn(),
          setResult: jest.fn(),
          addTeamMember: jest.fn(),
          removeTeamMember: jest.fn(),
          clearTeamMembers: jest.fn(),
          setAssessmentId: jest.fn(),
          reset: jest.fn(),
        };

        const partialized = partialize(fullState);

        // Should include persisted fields
        expect(partialized.nickname).toBe('test');
        expect(partialized.currentQuestionIndex).toBe(5);
        expect(partialized.answers).toEqual({ 1: 5 });
        expect(partialized.selectedConcerns).toEqual(['concern1']);
        expect(partialized.company).toBe('company');
        expect(partialized.department).toBe('dept');
        expect(partialized.jobRole).toBe('CEO');
        expect(partialized.email).toBe('test@test.com');
        expect(partialized.scores).toEqual({ vision: 80, execution: 75, empathy: 85, communication: 70, growth: 90 });
        expect(partialized.leadershipType).toBe('visionary');
        expect(partialized.teamMembers).toEqual([{ id: '1', name: 'member', type: 'supporter' }]);
        expect(partialized.assessmentId).toBe('id-123');

        // Should not include agreedToTerms (not in partialize list)
        expect(partialized.agreedToTerms).toBeUndefined();

        // Should not include functions
        expect(partialized.setNickname).toBeUndefined();
        expect(partialized.reset).toBeUndefined();
      }
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete assessment flow', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // 1. Start with nickname
      act(() => {
        result.current.setNickname('리더');
      });
      expect(result.current.nickname).toBe('리더');

      // 2. Answer questions
      act(() => {
        result.current.setAnswer(1, 5);
        result.current.nextQuestion();
        result.current.setAnswer(2, 4);
        result.current.nextQuestion();
        result.current.setAnswer(3, 3);
      });
      expect(result.current.currentQuestionIndex).toBe(2);
      expect(Object.keys(result.current.answers)).toHaveLength(3);

      // 3. Select concerns
      act(() => {
        result.current.toggleConcern('communication');
        result.current.toggleConcern('teamwork');
      });
      expect(result.current.selectedConcerns).toHaveLength(2);

      // 4. Fill profile
      act(() => {
        result.current.setProfile({
          company: '테스트회사',
          department: '개발팀',
          jobRole: 'CTO',
          email: 'leader@company.com',
          agreedToTerms: true,
        });
      });
      expect(result.current.agreedToTerms).toBe(true);

      // 5. Get result
      const scores = {
        vision: 85,
        execution: 78,
        empathy: 92,
        communication: 88,
        growth: 80,
      };
      act(() => {
        result.current.setResult(scores, 'empathetic');
        result.current.setAssessmentId('final-assessment-id');
      });
      expect(result.current.leadershipType).toBe('empathetic');
      expect(result.current.assessmentId).toBe('final-assessment-id');

      // 6. Add team members
      act(() => {
        result.current.addTeamMember('팀원A', 'supporter');
        result.current.addTeamMember('팀원B', 'challenger');
      });
      expect(result.current.teamMembers).toHaveLength(2);
    });

    it('should handle going back and changing answers', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Answer first few questions
      act(() => {
        result.current.setAnswer(1, 5);
        result.current.nextQuestion();
        result.current.setAnswer(2, 4);
        result.current.nextQuestion();
        result.current.setAnswer(3, 3);
      });

      expect(result.current.currentQuestionIndex).toBe(2);

      // Go back and change answer
      act(() => {
        result.current.prevQuestion();
        result.current.setAnswer(2, 2);
      });

      expect(result.current.currentQuestionIndex).toBe(1);
      expect(result.current.answers[2]).toBe(2);

      // Continue forward
      act(() => {
        result.current.nextQuestion();
      });
      expect(result.current.currentQuestionIndex).toBe(2);
      expect(result.current.answers[3]).toBe(3); // Original answer preserved
    });
  });
});
