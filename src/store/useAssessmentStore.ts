import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentScores, JobRole } from '@/types';

interface TeamMemberInput {
  id: string;
  name: string;
  type: string; // 팔로워십 유형
}

interface AssessmentState {
  // Onboarding
  nickname: string;
  setNickname: (nickname: string) => void;

  // Diagnosis
  currentQuestionIndex: number;
  answers: Record<number, number>;
  setAnswer: (questionId: number, score: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setCurrentQuestionIndex: (index: number) => void;

  // Concerns
  selectedConcerns: string[];
  toggleConcern: (concernId: string) => void;
  setConcerns: (concerns: string[]) => void;

  // Profile
  company: string;
  department: string;
  jobRole: JobRole | '';
  email: string;
  agreedToTerms: boolean;
  setProfile: (profile: {
    company?: string;
    department?: string;
    jobRole?: JobRole | '';
    email?: string;
    agreedToTerms?: boolean;
  }) => void;

  // Result
  scores: AssessmentScores | null;
  leadershipType: string | null;
  setResult: (scores: AssessmentScores, type: string) => void;

  // Team Members
  teamMembers: TeamMemberInput[];
  addTeamMember: (name: string, type: string) => void;
  removeTeamMember: (id: string) => void;
  clearTeamMembers: () => void;

  // Assessment ID (from DB)
  assessmentId: string | null;
  setAssessmentId: (id: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  nickname: '',
  currentQuestionIndex: 0,
  answers: {},
  selectedConcerns: [],
  company: '',
  department: '',
  jobRole: '' as const,
  email: '',
  agreedToTerms: false,
  scores: null,
  leadershipType: null,
  teamMembers: [],
  assessmentId: null,
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      ...initialState,

      setNickname: (nickname) => set({ nickname }),

      setAnswer: (questionId, score) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: score },
        })),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

      prevQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        })),

      setCurrentQuestionIndex: (index) =>
        set({ currentQuestionIndex: index }),

      toggleConcern: (concernId) =>
        set((state) => {
          const exists = state.selectedConcerns.includes(concernId);
          return {
            selectedConcerns: exists
              ? state.selectedConcerns.filter((id) => id !== concernId)
              : [...state.selectedConcerns, concernId],
          };
        }),

      setConcerns: (concerns) => set({ selectedConcerns: concerns }),

      setProfile: (profile) =>
        set((state) => ({
          company: profile.company ?? state.company,
          department: profile.department ?? state.department,
          jobRole: profile.jobRole ?? state.jobRole,
          email: profile.email ?? state.email,
          agreedToTerms: profile.agreedToTerms ?? state.agreedToTerms,
        })),

      setResult: (scores, type) =>
        set({ scores, leadershipType: type }),

      addTeamMember: (name, type) =>
        set((state) => ({
          teamMembers: [
            ...state.teamMembers,
            { id: crypto.randomUUID(), name, type },
          ],
        })),

      removeTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        })),

      clearTeamMembers: () => set({ teamMembers: [] }),

      setAssessmentId: (id) => set({ assessmentId: id }),

      reset: () => set(initialState),
    }),
    {
      name: 'leadmind-assessment',
      partialize: (state) => ({
        nickname: state.nickname,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        selectedConcerns: state.selectedConcerns,
        company: state.company,
        department: state.department,
        jobRole: state.jobRole,
        email: state.email,
        scores: state.scores,
        leadershipType: state.leadershipType,
        teamMembers: state.teamMembers,
        assessmentId: state.assessmentId,
      }),
    }
  )
);
