# LeadMind Insight

리더십 진단 및 팀 케어 솔루션을 제공하는 웹 애플리케이션입니다.

## 주요 기능

- **리더십 진단**: 23개 문항을 통한 리더십 유형 분석 (8가지 유형)
- **팀원 팔로워십 분석**: 팀원별 팔로워십 유형 파악 및 궁합 분석
- **맞춤형 솔루션**: 리더십 유형 × 고민 키워드 조합별 액션 플랜 제공
- **관리자 CMS**: 콘텐츠 관리 시스템 (질문, 유형, 솔루션 등)

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **상태 관리**: Zustand (persist 미들웨어)
- **스타일링**: Tailwind CSS
- **데이터 저장**: Google Sheets API, Prisma (선택)
- **검증**: Zod
- **배포**: Netlify

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 필요한 환경변수를 설정합니다.

```bash
cp .env.example .env.local
```

**필수 환경변수:**

```bash
# Google Sheets API
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 인증
JWT_SECRET=your-jwt-secret-at-least-32-characters
ADMIN_PASSWORD_HASH=bcrypt-hashed-password
ADMIN_SHEET_KEY=your-admin-sheet-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/
│   ├── (main)/          # 사용자 플로우 페이지
│   │   ├── onboarding/  # 온보딩
│   │   ├── diagnosis/   # 진단
│   │   ├── concerns/    # 고민 선택
│   │   ├── profile/     # 프로필 입력
│   │   ├── result/      # 결과 페이지
│   │   ├── team-input/  # 팀원 입력
│   │   ├── team-result/ # 팀 결과
│   │   └── upsell/      # 서비스 신청
│   ├── admin/           # 관리자 페이지
│   └── api/             # API 라우트
├── components/          # React 컴포넌트
├── lib/                 # 유틸리티 함수
├── store/               # Zustand 스토어
├── types/               # TypeScript 타입 정의
└── data/                # 정적 데이터
```

## API 문서

자세한 API 문서는 [docs/API.md](docs/API.md)를 참조하세요.

### 주요 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/health` | GET | 헬스 체크 |
| `/api/leadership` | GET | 리더십 유형 조회 |
| `/api/followership` | GET | 팔로워십 유형 조회 |
| `/api/questions` | GET | 진단 질문 조회 |
| `/api/assessments` | POST | 진단 데이터 저장 |
| `/api/service-request` | POST | 서비스 신청 |
| `/api/admin/auth` | POST | 관리자 로그인 |
| `/api/admin/content` | CRUD | 콘텐츠 관리 |

## 테스트

```bash
# 단위 테스트
npm test

# 커버리지 리포트
npm run test:coverage
```

테스트 가이드는 [TESTING.md](TESTING.md)를 참조하세요.

## 배포

### Netlify

```bash
# CLI로 배포
netlify deploy --prod
```

### 환경변수 설정

Netlify 대시보드 또는 CLI에서 환경변수를 설정합니다.

```bash
netlify env:set JWT_SECRET "your-secret"
netlify env:set ADMIN_PASSWORD_HASH "your-hash"
```

## 코드 품질

- **TypeScript**: strict 모드 사용
- **ESLint**: Next.js 권장 설정
- **입력 검증**: Zod 스키마 기반
- **로깅**: 구조화된 logger 유틸리티

코드 리뷰 보고서는 [CODE_REVIEW.md](CODE_REVIEW.md)를 참조하세요.

## 라이선스

Private - All Rights Reserved
