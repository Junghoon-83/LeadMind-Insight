# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

리드마인드인사이트(LeadMind Insight)는 리더십 역량 진단 웹 애플리케이션입니다. 리더의 리더십 유형을 진단하고, 팀 운영 고민을 분석하여 맞춤 솔루션을 제공합니다. 팀원의 팔로워십 유형과 리더-팔로워 궁합 분석 기능도 포함되어 있습니다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack)
- **스타일링**: Tailwind CSS v4
- **애니메이션**: Framer Motion
- **상태관리**: Zustand (localStorage 영속성)
- **데이터베이스**: MySQL + Prisma ORM (선택사항 - 없어도 static 데이터로 동작)
- **아이콘**: Lucide React

## 아키텍처

### 라우트 그룹

Next.js 라우트 그룹으로 레이아웃 분리:

- `src/app/(main)/` - 사용자용 페이지 (모바일 최적화, max-width: 430px)
- `src/app/admin/` - 관리자 CMS (데스크톱 전체 너비)

### 사용자 플로우

1. **온보딩** (`/onboarding`) - 소개 슬라이드
2. **진단** (`/diagnosis`) - 23개 리더십 진단 문항
3. **고민 선택** (`/concerns`) - 15개 팀 운영 고민 (4개 카테고리: E/G/C/L)
4. **로딩** (`/loading`) - 결과 계산
5. **결과** (`/result`) - 리더십 유형 + 고민 분석 + 솔루션
6. **팀원 입력** (`/team-input`) - 팀원 및 팔로워십 유형 입력
7. **팀 결과** (`/team-result`) - 리더-팔로워 궁합 분석

### 데이터 레이어

모든 콘텐츠 데이터는 `src/data/`에 위치:

| 파일 | 내용 |
|------|------|
| `questions.ts` | 23개 진단 문항 (growth/sharing/interaction 카테고리) |
| `leadershipTypes.ts` | 8개 리더십 유형 (L01-L08) + `determineLeadershipType()` 함수 |
| `concerns.ts` | 15개 고민 + `analyzeConcerns()` Z-score 계산 |
| `solutions.ts` | 11개 솔루션 (P01-P11) + `getSolution()` 조회 |
| `followershipTypes.ts` | 5개 팔로워십 유형 + 40개 궁합 조합 |

### 상태 관리

`useAssessmentStore` (Zustand)가 전체 진단 플로우 관리:
- 사용자 정보, 응답, 점수, 리더십 유형
- 선택한 고민, 팀원 목록
- localStorage `leadmind-assessment` 키로 영속화

### 리더십 유형 결정 로직

`leadershipTypes.ts`의 `determineLeadershipType(scores)`:
- growth, sharing, interaction 점수를 4.5 기준으로 비교
- 높음/낮음 조합에 따라 8개 유형(L01-L08) 중 하나 반환

### 고민 분석 (Z-Score)

`concerns.ts`의 `analyzeConcerns(selectedConcernIds)`:
- 카테고리별(E/G/C/L) 선택 비율 계산
- 상위 2개 카테고리를 `primaryA`, `primaryB`로 반환
- 솔루션 조합에 매핑 (예: "L+E" → P01)

### Admin CMS

`/admin` 경로에서 모든 콘텐츠 CRUD 제공:
- Database 미설정 시 static 데이터로 읽기 전용 동작
- 수정 기능은 MySQL 설정 필요
- 스키마: `prisma/schema.prisma`

## 디자인 패턴

- **모바일 퍼스트**: 사용자 페이지는 `app-container` 클래스 (430px 최대 너비)
- **한국어 UI**: 모든 사용자 인터페이스는 한국어
- **그라데이션 테마**: 보라색 계열 그라데이션 (`globals.css`에 정의)
