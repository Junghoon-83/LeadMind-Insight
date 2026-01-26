import type { Question } from '@/types';

// 23개 리더십 진단 문항
// 카테고리: growth(성장), sharing(공유), interaction(상호작용)
export const questions: Question[] = [
  {
    id: 1,
    text: '우리 팀은 팀원 간의 업무 진행 상황을 서로 잘 알고 있다.',
    category: 'sharing',
    subcategory: 's1_진행공유',
  },
  {
    id: 2,
    text: '업무 진행 시 경험하는 고충/어려움 등에 대해서 팀원들과 대화하는 시간이 있다.',
    category: 'interaction',
    subcategory: 'i1_정서케어',
  },
  {
    id: 3,
    text: '업무 중 발생하는 실수에 대한 피드백이 상황이나 나의 기분에 따라 유동적이지 않고 일관적인 편이다.',
    category: 'growth',
    subcategory: 'g1_실패학습',
  },
  {
    id: 4,
    text: '평상시 팀원들의 업무량에 대해 잘 이해하고 있으며, 이를 바탕으로 업무 분장을 고려한다.',
    category: 'sharing',
    subcategory: 's1_진행공유',
  },
  {
    id: 5,
    text: '팀원의 개인적인 고충에 대해서도 관심을 갖고 1:1 미팅을 정기적으로 진행하는 편이다.',
    category: 'interaction',
    subcategory: 'i1_정서케어',
  },
  {
    id: 6,
    text: '나는 중요한 업무가 완료된 후, 배운 점이나 개선할 점 등에 대해 팀이 대화할 수 있도록 시간을 마련한다.',
    category: 'growth',
    subcategory: 'g1_실패학습',
  },
  {
    id: 7,
    text: '팀원들이 개별 업무 진행할 때, 각 작업물의 목적이 전체 업무의 목적과 어떻게 일치(alignment)되는지를 상기하며 진행하도록 독려한다.',
    category: 'sharing',
    subcategory: 's2_목표공유',
  },
  {
    id: 8,
    text: '업무를 주고자 하는 팀원의 업무량이 많을 경우, 지원이 필요한 업무를 확인하여 도움을 제공하는 등 업무 조율을 위해 적극적으로 개입을 시도한다.',
    category: 'interaction',
    subcategory: 'i2_문제해결',
  },
  {
    id: 9,
    text: '나는 새롭고 도전적인 업무를 팀원들이 시도할 수 있도록 기회를 제공하고 동기를 부여하는 편이다.',
    category: 'growth',
    subcategory: 'g2_도전촉진',
  },
  {
    id: 10,
    text: '업무를 시작하기 전, 해당 프로젝트의 목표에 관해 설명함으로써 팀원들이 프로젝트의 전체 그림을 이해할 수 있도록 한다.',
    category: 'sharing',
    subcategory: 's2_목표공유',
  },
  {
    id: 11,
    text: '문제 해결을 위해서, 다른 리더와의 조율이 필요한 경우 개입하여 어려움이 해소되도록 돕는 편이다.',
    category: 'interaction',
    subcategory: 'i2_문제해결',
  },
  {
    id: 12,
    text: '팀원들의 성장을 촉진하기 위해서 같은 업무도 팀 구성원들이 새로운 진행 방식을 제안할 수 있도록 독려하는 편이다.',
    category: 'growth',
    subcategory: 'g2_도전촉진',
  },
  {
    id: 13,
    text: '업무 진행 시 나의 권한으로 업무 분장을 하기보다, 팀원들의 의견을 적극적으로 수용하여 정하려 노력하는 편이다.',
    category: 'sharing',
    subcategory: 's3_의견반영',
  },
  {
    id: 14,
    text: '나는 내 생각이나 느낌을 팀원들과 솔직하게 나누는 것이 편하다.',
    category: 'interaction',
    subcategory: 'i3_개방성',
  },
  {
    id: 15,
    text: '업무 결과물이 수준 이상의 완성도를 지닐 때까지 시간과 에너지를 모두 집중해서 진행하도록 독려하는 편이다.',
    category: 'growth',
    subcategory: 'g3_결과수준',
  },
  {
    id: 16,
    text: '업무 진행을 위한 전략 등 주요한 안건은 팀에서 상의하여 정하는 편이다.',
    category: 'sharing',
    subcategory: 's3_의견반영',
  },
  {
    id: 17,
    text: '업무 진행 시 힘든 부분이나 애로 사항 등에 대해서 나를 포함한 팀 모두가 자유롭게 이야기하는 분위기이다.',
    category: 'interaction',
    subcategory: 'i3_개방성',
  },
  {
    id: 18,
    text: '업무 결과물에 대한 기준을 일관되게 적용하여 팀원들이 기대되는 결과물의 질적 수준을 이해할 수 있도록 촉진한다.',
    category: 'growth',
    subcategory: 'g3_결과수준',
  },
  {
    id: 19,
    text: '서로 다른 성향/업무 스타일의 팀원들이 서로를 잘 이해하고 업무를 진행할 수 있도록 리더로서 중간에서 이해를 돕는 편이다.',
    category: 'interaction',
    subcategory: 'i4_팀역동이해',
  },
  {
    id: 20,
    text: '내가 요청하기 이전에도, 팀원들이 업무 진행과 관련된 내용을 먼저 다가와 소통할 수 있도록 자주 촉진한다.',
    category: 'growth',
    subcategory: 'g4_주도성촉진',
  },
  {
    id: 21,
    text: '팀원들의 각기 다른 성향과 특징을 이해하기 위해서 다양한 방법을 통해 (예-1:1 미팅, 팀 활동 등) 소통하고자 노력하는 편이다.',
    category: 'interaction',
    subcategory: 'i4_팀역동이해',
  },
  {
    id: 22,
    text: '단순히 업무를 잘하는 것뿐만 아니라, 현재 우리가 하는 일의 의미를 이해할 수 있도록 팀원과 대화하는 편이다.',
    category: 'growth',
    subcategory: 'g5_일의의미',
  },
  {
    id: 23,
    text: '나는 팀원이 현재 진행하는 일이 업무적으로 성장하는데 어떤 도움을 줄 수 있는지 대화하는 편이다.',
    category: 'growth',
    subcategory: 'g5_일의의미',
  },
];

export const TOTAL_QUESTIONS = questions.length;

// 카테고리별 문항 수
export const CATEGORY_COUNTS = {
  sharing: questions.filter((q) => q.category === 'sharing').length,      // 공유: 6문항
  interaction: questions.filter((q) => q.category === 'interaction').length, // 상호작용: 8문항
  growth: questions.filter((q) => q.category === 'growth').length,        // 성장: 9문항
};
