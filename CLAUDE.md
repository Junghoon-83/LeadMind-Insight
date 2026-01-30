# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

LeadMind Insight는 리더십 진단 및 팀 케어 솔루션 웹앱입니다. 23개 문항 진단을 통해 8가지 리더십 유형(L01-L08)을 분석하고, 팀원 팔로워십 유형(F01-F05)과의 궁합을 제공합니다.

## 명령어

```bash
npm run dev              # 개발 서버 (localhost:3000)
npm run build            # 프로덕션 빌드 (prisma generate 포함)
npm run lint             # ESLint 검사
npm test                 # Jest 테스트 실행
npm test -- --watch      # 테스트 감시 모드
npm test -- path/file.test.ts  # 단일 테스트 파일
npm run test:coverage    # 커버리지 리포트
netlify deploy --prod    # Netlify 프로덕션 배포
npm run hash-password    # 관리자 비밀번호 해시 생성
npm run db:seed          # 정적 데이터 → DB 싱크
npm run db:push          # Prisma 스키마 → DB 반영
npm run db:studio        # Prisma Studio (DB GUI)
```

## 아키텍처

### 라우트 그룹
- `src/app/(main)/` - 사용자 페이지 (모바일 최적화, max-width: 430px)
- `src/app/admin/` - 관리자 CMS (데스크톱 전체 너비)

### 사용자 플로우
onboarding → diagnosis → concerns → profile → result → team-input → team-result → upsell

### 데이터 계층 (우선순위)
1. **Prisma DB**: `DATABASE_URL` 설정 시 DB 우선 사용
2. **정적 데이터**: `src/data/` 폴더에서 폴백
3. **Google Sheets**: 진단 결과/서비스 신청 저장 (`src/lib/googleSheets.ts`)

### DB 싱크 (단방향)
```
코드 (src/data/*.ts) → npm run db:seed → DB
```
- **개발 시**: 정적 데이터 파일 수정 후 `npm run db:seed` 실행
- **운영 시**: Admin CMS에서 DB 직접 수정 (DB가 source of truth)
- **주의**: DB 수정 내용은 코드 파일에 자동 반영되지 않음

### 상태 관리 (Zustand)
- `useAssessmentStore`: 진단 상태 (닉네임, 답변, 고민, 프로필, 결과, 팀원)
- `useAdminStore`: 관리자 인증 상태
- persist 미들웨어로 localStorage 저장, partialize로 필요한 필드만 영속화

### API 구조
| 경로 | 메서드 | 인증 | 용도 |
|------|--------|------|------|
| `/api/leadership` | GET | 없음 | 리더십 유형 조회 |
| `/api/followership` | GET | 없음 | 팔로워십 유형 조회 |
| `/api/questions` | GET | 없음 | 진단 질문 조회 |
| `/api/assessments` | POST | 없음 | 진단 데이터 저장 |
| `/api/admin/*` | ALL | JWT | 관리자 API (middleware.ts에서 검증) |

## 핵심 패턴

### 로깅
서버 측 코드는 `console.log` 대신 `src/lib/logger.ts` 사용:
```typescript
import { logger } from '@/lib/logger';
logger.info('메시지', { context: 'value' });
logger.error('에러', {}, error);
```

### 입력 검증
`src/lib/validations.ts`에서 Zod 스키마 사용. 리더십 코드는 `L01~L99`, 팔로워십은 `F01~F99` 형식.

### 시간 처리
한국 시간(KST) 포맷은 `src/lib/saveAssessment.ts`의 `getKoreanTime()` 함수 공유 사용.

### 환경변수
`src/lib/env.ts`에서 Zod 기반 검증. 프로덕션에서 필수 환경변수 누락 시 에러.

## 데이터 파일

| 파일 | 내용 |
|------|------|
| `data/questions.ts` | 23개 진단 문항 (growth/sharing/interaction) |
| `data/leadershipTypes.ts` | 8개 리더십 유형 + `determineLeadershipType()` |
| `data/concerns.ts` | 15개 고민 + `analyzeConcerns()` Z-score |
| `data/solutions.ts` | 솔루션 + `getSolution()` 조회 |
| `data/followershipTypes.ts` | 5개 팔로워십 유형 + 궁합 데이터 |

## 리더십 유형 결정 로직

`determineLeadershipType(scores)`: growth, sharing, interaction 점수를 4.5 기준으로 비교하여 8개 유형(L01-L08) 중 하나 반환.

## 타입 시스템

`src/types/index.ts`에서 핵심 타입 정의:
- `DiagnosisScore`: 1-6 점수
- `LeadershipTypeInfo`, `FollowershipTypeInfo`: 유형 정보
- `Assessment`, `AssessmentScores`: 진단 결과

## 테스트

테스트 파일은 `__tests__/` 폴더 또는 `.test.ts` 확장자. 주요 테스트: `lib/auth.ts`, `lib/validations.ts`, `lib/logger.ts`, `store/` 스토어들.

## 참고 문서

- API 문서: `docs/API.md`
- 테스트 가이드: `TESTING.md`
- 코드 리뷰: `CODE_REVIEW.md`
