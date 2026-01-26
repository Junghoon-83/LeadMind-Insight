import { act } from '@testing-library/react';
import { useAssessmentStore } from '../useAssessmentStore';

describe('useAssessmentStore hydration', () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useAssessmentStore.getState().reset();
      useAssessmentStore.setState({ _hasHydrated: false });
    });
    localStorage.clear();
  });

  describe('_hasHydrated flag', () => {
    it('should start with _hasHydrated as false', () => {
      const state = useAssessmentStore.getState();
      expect(state._hasHydrated).toBe(false);
    });

    it('should set _hasHydrated to true via setHasHydrated', () => {
      act(() => {
        useAssessmentStore.getState().setHasHydrated(true);
      });

      expect(useAssessmentStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe('previous data detection logic', () => {
    it('should detect completed assessment when leadershipType exists', () => {
      act(() => {
        useAssessmentStore.setState({
          leadershipType: 'L01',
          answers: { 1: 5, 2: 4 },
          nickname: '테스트',
          _hasHydrated: true,
        });
      });

      const state = useAssessmentStore.getState();
      const hasResult = !!state.leadershipType;
      const hasAnswers = Object.keys(state.answers).length > 0;

      expect(hasResult).toBe(true);
      expect(hasAnswers).toBe(true);
      // 완료된 진단: leadershipType 존재
      expect(state.leadershipType).toBe('L01');
    });

    it('should detect in-progress assessment when only answers exist', () => {
      act(() => {
        useAssessmentStore.setState({
          leadershipType: null,
          answers: { 1: 5, 2: 4, 3: 3 },
          nickname: '테스트',
          _hasHydrated: true,
        });
      });

      const state = useAssessmentStore.getState();
      const hasResult = !!state.leadershipType;
      const hasAnswers = Object.keys(state.answers).length > 0;

      expect(hasResult).toBe(false);
      expect(hasAnswers).toBe(true);
      // 진행 중: answers만 존재
    });

    it('should detect no previous data when empty', () => {
      act(() => {
        useAssessmentStore.setState({
          leadershipType: null,
          answers: {},
          nickname: '',
          _hasHydrated: true,
        });
      });

      const state = useAssessmentStore.getState();
      const hasResult = !!state.leadershipType;
      const hasAnswers = Object.keys(state.answers).length > 0;

      expect(hasResult).toBe(false);
      expect(hasAnswers).toBe(false);
      // 새 사용자: 데이터 없음
    });
  });

  describe('reset functionality', () => {
    it('should clear all data on reset', () => {
      // Set some data
      act(() => {
        useAssessmentStore.setState({
          nickname: '테스트',
          leadershipType: 'L01',
          answers: { 1: 5, 2: 4 },
          scores: { growth: 5, sharing: 4, interaction: 4.5 },
          selectedConcerns: ['C01', 'C02'],
          _hasHydrated: true,
        });
      });

      // Reset
      act(() => {
        useAssessmentStore.getState().reset();
      });

      const state = useAssessmentStore.getState();
      expect(state.nickname).toBe('');
      expect(state.leadershipType).toBeNull();
      expect(state.answers).toEqual({});
      expect(state.scores).toBeNull();
      expect(state.selectedConcerns).toEqual([]);
    });
  });
});
