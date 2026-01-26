import type { Concern } from '@/types';

// 카테고리 정의
// E: 팀 실행력 높이기
// G: 팀 성장 역량 확보
// C: 협업&소통 문화 점검
// L: 리더십 방향성 설정

export type ConcernCategory = 'E' | 'G' | 'C' | 'L';

export interface ConcernItem extends Concern {
  categories: ConcernCategory[]; // 복수 카테고리 가능 (예: E/G)
  groupName: string;
}

// 15개 팀 운영 고민 키워드
export const concerns: ConcernItem[] = [
  // 팀 실행력 높이기 (E)
  {
    id: '1',
    label: '회의 내용이 빨리 실행되게 하려면?',
    categories: ['E'],
    groupName: '팀 실행력 높이기',
  },
  {
    id: '2',
    label: '논의한 내용과 팀원의 작업이 일치하려면?',
    categories: ['E'],
    groupName: '팀 실행력 높이기',
  },
  {
    id: '3',
    label: '개인 성장이 팀 성과로 바로 연결되게 하려면?',
    categories: ['E', 'G'], // 교차 주제
    groupName: '팀 실행력 높이기',
  },
  {
    id: '4',
    label: '정체된 우리 팀의 성과를 다시 끌어올리려면?',
    categories: ['E'],
    groupName: '팀 실행력 높이기',
  },
  {
    id: '5',
    label: '팀의 신뢰와 업무 속도, 둘 다 놓치지 않으려면?',
    categories: ['E', 'G'], // 교차 주제
    groupName: '팀 실행력 높이기',
  },

  // 팀 성장 역량 확보 (G)
  {
    id: '6',
    label: '팀원들의 의욕에 다시 불을 지피려면?',
    categories: ['G'],
    groupName: '팀 성장 역량 확보',
  },
  {
    id: '7',
    label: '서로 돕고 자극받으며 함께 성장하는 팀이 되려면?',
    categories: ['G'],
    groupName: '팀 성장 역량 확보',
  },
  {
    id: '8',
    label: '팀원들이 스스로 움직이는 자율적인 팀이 되려면?',
    categories: ['G'],
    groupName: '팀 성장 역량 확보',
  },
  {
    id: '9',
    label: '기대에 못 미치는 팀원, 어떻게 이끌어야 하죠?',
    categories: ['G'],
    groupName: '팀 성장 역량 확보',
  },

  // 협업&소통 문화 점검 (C)
  {
    id: '10',
    label: "개인플레이 대신 '원팀'으로 시너지를 내려면?",
    categories: ['C'],
    groupName: '협업&소통 문화 점검',
  },
  {
    id: '11',
    label: '친밀감을 팀 성과로 연결하려면?',
    categories: ['C'],
    groupName: '협업&소통 문화 점검',
  },
  {
    id: '12',
    label: '모두가 납득하는 명확한 팀 원칙을 세우려면?',
    categories: ['C'],
    groupName: '협업&소통 문화 점검',
  },
  {
    id: '13',
    label: "상처 주지 않고 필요한 '쓴소리'를 잘 하려면?",
    categories: ['C'],
    groupName: '협업&소통 문화 점검',
  },

  // 리더십 방향성 설정 (L)
  {
    id: '14',
    label: '흔들리지 않고 리더십의 중심을 잡으려면?',
    categories: ['L'],
    groupName: '리더십 방향성 설정',
  },
  {
    id: '15',
    label: '리더의 압박과 스트레스를 잘 관리하려면?',
    categories: ['L'],
    groupName: '리더십 방향성 설정',
  },
];

// 카테고리별 총 문항 수 (Z점수 계산용)
// 교차 주제는 각 카테고리에 모두 포함
export const CATEGORY_TOTALS: Record<ConcernCategory, number> = {
  E: 5, // 1,2,3,4,5
  G: 6, // 3,5,6,7,8,9 (3,5는 교차)
  C: 4, // 10,11,12,13
  L: 2, // 14,15
};

// 카테고리 이름
export const CATEGORY_NAMES: Record<ConcernCategory, string> = {
  E: '팀 실행력 높이기',
  G: '팀 성장 역량 확보',
  C: '협업&소통 문화 점검',
  L: '리더십 방향성 설정',
};

/**
 * 선택된 고민들을 분석하여 핵심 고민 A, B를 도출
 */
export function analyzeConcerns(selectedIds: string[]): {
  primaryA: ConcernCategory | null;
  primaryB: ConcernCategory | null;
  combinationId: string;
  zScores: Record<ConcernCategory, number>;
} {
  // 1. 카테고리별 선택 횟수 계산 (교차 주제는 양쪽 모두 1점)
  const categoryCounts: Record<ConcernCategory, number> = { E: 0, G: 0, C: 0, L: 0 };

  selectedIds.forEach((id) => {
    const concern = concerns.find((c) => c.id === id);
    if (concern) {
      concern.categories.forEach((cat) => {
        categoryCounts[cat]++;
      });
    }
  });

  // 2. Z점수 계산 (선택된 수 / 해당 카테고리 총 수)
  const zScores: Record<ConcernCategory, number> = {
    E: categoryCounts.E / CATEGORY_TOTALS.E,
    G: categoryCounts.G / CATEGORY_TOTALS.G,
    C: categoryCounts.C / CATEGORY_TOTALS.C,
    L: categoryCounts.L / CATEGORY_TOTALS.L,
  };

  // 3. L코드 선택 여부 확인
  const hasL = categoryCounts.L > 0;

  // 4. 핵심 고민 A, B 결정
  let primaryA: ConcernCategory | null = null;
  let primaryB: ConcernCategory | null = null;

  if (hasL) {
    // L이 있으면 A = L
    primaryA = 'L';

    // 나머지 중 Z점수 가장 높은 것이 B
    const remaining: ConcernCategory[] = ['E', 'G', 'C'];
    const sorted = remaining.sort((a, b) => {
      if (zScores[b] !== zScores[a]) return zScores[b] - zScores[a];
      // 동점시 G > C > E 우선순위
      const priority: Record<ConcernCategory, number> = { G: 3, C: 2, E: 1, L: 0 };
      return priority[b] - priority[a];
    });

    // B는 Z점수가 0보다 큰 경우만
    if (zScores[sorted[0]] > 0) {
      primaryB = sorted[0];
    }
  } else {
    // L이 없으면 E, G, C 중 Z점수 높은 2개
    const categories: ConcernCategory[] = ['E', 'G', 'C'];
    const sorted = categories.sort((a, b) => {
      if (zScores[b] !== zScores[a]) return zScores[b] - zScores[a];
      // 동점시 G > C > E 우선순위
      const priority: Record<ConcernCategory, number> = { G: 3, C: 2, E: 1, L: 0 };
      return priority[b] - priority[a];
    });

    if (zScores[sorted[0]] > 0) primaryA = sorted[0];
    if (zScores[sorted[1]] > 0) primaryB = sorted[1];
  }

  // 5. 조합 ID 결정
  const combinationId = determineCombinationId(primaryA, primaryB, zScores);

  return { primaryA, primaryB, combinationId, zScores };
}

/**
 * 핵심 고민 조합에 따른 솔루션 ID 결정
 */
function determineCombinationId(
  a: ConcernCategory | null,
  b: ConcernCategory | null,
  zScores: Record<ConcernCategory, number>
): string {
  // 모든 영역에서 고민이 있는 경우 (L + E + G + C)
  const allHigh = zScores.L > 0 && zScores.E > 0 && zScores.G > 0 && zScores.C > 0;
  if (allHigh && a === 'L') {
    return 'P07'; // L+E+G+C
  }

  // 단일 카테고리만 선택된 경우
  if (a && !b) {
    switch (a) {
      case 'L': return 'P08';
      case 'E': return 'P09';
      case 'G': return 'P10';
      case 'C': return 'P11';
    }
  }

  // 두 카테고리 조합
  if (a && b) {
    const combo = [a, b].sort().join('+');
    switch (combo) {
      case 'E+L': return 'P01';
      case 'G+L': return 'P02';
      case 'C+L': return 'P03';
      case 'E+G': return 'P04';
      case 'C+E': return 'P05';
      case 'C+G': return 'P06';
    }
  }

  // 기본값
  return 'P08';
}
