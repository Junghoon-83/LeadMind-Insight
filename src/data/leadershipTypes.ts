import type { LeadershipTypeInfo, AssessmentScores } from '@/types';
import { questions } from './questions';

// 8가지 리더십 유형
export const leadershipTypes: Record<string, LeadershipTypeInfo> = {
  L01: {
    type: 'L01',
    name: '공동 비전형 리더',
    title: '큰 그림으로 팀의 에너지를 하나로 모으는 전략가',
    image: '/images/leadership/L01.png',
    description:
      '리더님은 명확한 목적지를 제시하고, 팀원들이 자발적으로 그 여정에 동참하도록 독려하는 스타일입니다.',
    strengths: [
      '팀 전체의 자율성을 존중',
      '중장기적인 방향성 설정',
      '팀의 존재 이유를 명확히 하는 데 탁월',
    ],
    challenges: [
      '비전이 지나치게 추상적일 경우, 실무 단계에서 팀원들이 구체적인 우선순위를 혼동할 수 있습니다.',
      "주기적으로 '비전의 구체화'를 통해 '그래서 오늘 어떤 일을 해야 하는가'로 연결하는 활동이 중요합니다.",
    ],
  },
  L02: {
    type: 'L02',
    name: '성장 파트너형 리더',
    title: '질문과 경청으로 팀의 잠재력을 폭발시키는 조력자',
    image: '/images/leadership/L02.png',
    description:
      '리더님은 정답을 주기보다 팀원이 스스로 답을 찾게 돕고, 팀 전체의 학습 문화를 중시하는 스타일입니다.',
    strengths: [
      '수평적인 소통을 통해 팀원들의 심리적 안전감을 높임',
      '실패를 성장의 발판으로 삼는 단단한 조직력',
    ],
    challenges: [
      '성장에만 집중하다 보면 당장 해결해야 할 긴급 실무의 속도가 떨어질 수 있습니다.',
      '가끔은 단호한 의사결정으로 속도를 조절하세요.',
    ],
  },
  L03: {
    type: 'L03',
    name: '운영 중심형 리더',
    title: '시스템으로 성과를 만드는 PM형 실무자',
    image: '/images/leadership/L03.png',
    description:
      '리더님은 공동 목표와 효율적인 역할(R&R)에 능숙한 프로젝트 매니저(PM) 스타일입니다.',
    strengths: [
      '의견 수렴을 통한 프로세스 최적화',
      '병목 해결 능력이 뛰어남',
      '안정적인 팀 운영 시스템 구축',
    ],
    challenges: [
      '팀 전체 업무 운영에 집중하다 보니, 개별 팀원의 고충을 살피거나 개인의 성장을 업무와 연결하는 밀착 케어 활동은 다소 떨어질 수 있습니다.',
      '1:1을 통해 팀원의 팔로워십 특성을 이해하는 것이 중요합니다.',
    ],
  },
  L04: {
    type: 'L04',
    name: '화합 중심형 리더',
    title: '팀 유대감과 정서적 연결로 단단한 원팀을 만드는 연결자',
    image: '/images/leadership/L04.png',
    description:
      '리더님은 팀 내의 소통 흐름과 구성원의 정서 상태를 세심하게 살피며, 협업을 중시하는 스타일입니다.',
    strengths: [
      '갈등 중재 능력이 뛰어남',
      '팀의 응집력을 높이는 역량',
      '리더를 중심으로 한 끈끈한 신뢰 관계는 위기 상황에서 강력한 힘 발휘',
    ],
    challenges: [
      "좋은 관계를 해치지 않으려다 보니, 불편하지만 꼭 필요한 '성과 독려'나 '쓴소리'를 피하는 경우가 있습니다.",
      '안전한 관계 속에서의 피드백은 팀원의 성장을 촉진하는 만큼, 1:1 피드백의 시간을 확대해 보세요.',
    ],
  },
  L05: {
    type: 'L05',
    name: '통찰력 있는 멘토 리더',
    title: '팀원 한 명 한 명의 가치를 발견하고 커리어에 도움을 주는 멘토',
    image: '/images/leadership/L05.png',
    description:
      '리더님은 팀원 개인의 강점과 가치관을 깊이 이해하고, 이를 조직 목표와 연결해 주는 1:1 커스터마이징 리더십에 강점이 있습니다.',
    strengths: [
      '팀원들은 리더와 대화하며 자신의 존재 가치를 체감',
      '개인의 성장이 곧 팀의 성과라는 강력한 동기 부여',
    ],
    challenges: [
      "업무 구조화나 문제 해결 지원 없이 '알아서 하라'는 방식일 경우, 방임으로 비쳐 불만을 키울 수 있습니다.",
      '업무를 단계별로 정리해 주고, 발생한 문제는 함께 해결하며 실행을 도우세요.',
    ],
  },
  L06: {
    type: 'L06',
    name: '안식처형 리더',
    title: '깊은 신뢰와 1:1 지지로 팀원의 마음을 얻는 리더',
    image: '/images/leadership/L06.png',
    description:
      '리더님은 격식 없는 대화와 진심 어린 관심을 통해 팀원 개개인과 깊은 인간적 유대를 맺는 스타일입니다.',
    strengths: [
      '리더에 대한 높은 충성도와 신뢰 형성',
      '팀원들은 심리적 안정을 바탕으로 각자의 자리에서 묵묵히 제 역할 수행',
    ],
    challenges: [
      '친밀한 관계가 업무 경계를 흐려 과도한 개입(마이크로 매니징)으로 이어질 수 있습니다.',
      '실무 과정은 단계적으로 위임하되, 팀원이 필요로 하는 시점에 적절히 지원하여 자립과 성장을 독려하세요.',
    ],
  },
  L07: {
    type: 'L07',
    name: '맞춤 촉진형 리더',
    title: '개인의 역량에 맞춘 섬세한 가이드로 퍼포먼스를 끌어올리는 코치',
    image: '/images/leadership/L07.png',
    description:
      '리더님은 팀원 개개인의 업무 숙련도에 맞춰 피드백의 수위를 조절하고, 부족한 역량을 정확히 짚어 보완해 주는 스타일입니다.',
    strengths: [
      '신규 입사자나 정체기에 있는 팀원을 몰입하게 만드는 능력이 탁월',
      '개인별 맞춤 피드백을 통해 업무 품질을 상향 평준화',
    ],
    challenges: [
      '리더의 개입 활동이 높을 경우, 피드백에 대한 의존성을 높여 팀원의 주도적 성장을 저해할 수 있습니다.',
      '가이드의 비중을 단계적으로 줄여나가며, 팀원이 스스로 판단하고 실행하는 업무 자립 환경을 조성해 보세요.',
    ],
  },
  L08: {
    type: 'L08',
    name: '리더십 전환기 리더',
    title: '기존의 관성을 깨고 새로운 리더십 기준을 찾는 전환자',
    image: '/images/leadership/L08.png',
    description:
      '리더님은 현재 기존의 팀 운영 방식과 새로운 시도 사이에서 최적의 균형점을 찾아가는 과정에 있습니다.',
    strengths: [
      '리더십의 틀을 고정하지 않고 유연하게 변화를 모색하는 단계',
      '관점을 바꾸고 팀의 새로운 업무 방식을 만들 수 있는 좋은 기회',
    ],
    challenges: [
      '전환기에 대한 관점이 불안하거나 부정적일 경우 팀 성과에 영향이 클 수 있습니다.',
      '혼자 고민하기보다 외부 전문가나 동료 리더의 지원을 성장의 발판으로 삼으세요.',
    ],
  },
};

/**
 * 응답 데이터를 기반으로 카테고리별 점수 계산
 * 각 카테고리의 평균 점수를 반환 (1-6점 척도)
 */
export function calculateScores(answers: Record<number, number>): AssessmentScores {
  const categoryScores: Record<string, number[]> = {
    sharing: [],
    interaction: [],
    growth: [],
  };

  // 각 문항의 응답을 카테고리별로 분류
  questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      categoryScores[question.category].push(answer);
    }
  });

  // 카테고리별 평균 계산
  const calcAverage = (scores: number[]) =>
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    sharing: Math.round(calcAverage(categoryScores.sharing) * 100) / 100,
    interaction: Math.round(calcAverage(categoryScores.interaction) * 100) / 100,
    growth: Math.round(calcAverage(categoryScores.growth) * 100) / 100,
  };
}

/**
 * 점수 기반 리더십 유형 판정
 * 기준: 각 카테고리 평균 4.5 이상/미만
 *
 * 공유(sharing) | 상호작용(interaction) | 성장(growth) | 유형
 * ≥4.5          | <4.5                  | ≥4.5         | L01 공동 비전형
 * ≥4.5          | ≥4.5                  | ≥4.5         | L02 성장 파트너형
 * ≥4.5          | <4.5                  | <4.5         | L03 운영 중심형
 * ≥4.5          | ≥4.5                  | <4.5         | L04 화합 중심형
 * <4.5          | <4.5                  | ≥4.5         | L05 통찰력 있는 멘토
 * <4.5          | ≥4.5                  | <4.5         | L06 안식처형
 * <4.5          | ≥4.5                  | ≥4.5         | L07 맞춤 촉진형
 * <4.5          | <4.5                  | <4.5         | L08 리더십 전환기
 */
export function determineLeadershipType(scores: AssessmentScores): string {
  const THRESHOLD = 4.5;

  const sharingHigh = scores.sharing >= THRESHOLD;
  const interactionHigh = scores.interaction >= THRESHOLD;
  const growthHigh = scores.growth >= THRESHOLD;

  // 8가지 조합에 따른 유형 결정
  if (sharingHigh && !interactionHigh && growthHigh) {
    return 'L01'; // 공동 비전형 리더
  }
  if (sharingHigh && interactionHigh && growthHigh) {
    return 'L02'; // 성장 파트너형 리더
  }
  if (sharingHigh && !interactionHigh && !growthHigh) {
    return 'L03'; // 운영 중심형 리더
  }
  if (sharingHigh && interactionHigh && !growthHigh) {
    return 'L04'; // 화합 중심형 리더
  }
  if (!sharingHigh && !interactionHigh && growthHigh) {
    return 'L05'; // 통찰력 있는 멘토 리더
  }
  if (!sharingHigh && interactionHigh && !growthHigh) {
    return 'L06'; // 안식처형 리더
  }
  if (!sharingHigh && interactionHigh && growthHigh) {
    return 'L07'; // 맞춤 촉진형 리더
  }
  // !sharingHigh && !interactionHigh && !growthHigh
  return 'L08'; // 리더십 전환기 리더
}
