# LeadMind Insight API 문서

## 개요

LeadMind Insight는 Next.js App Router 기반의 RESTful API를 제공합니다.

**Base URL**: `https://leadmind-insight.netlify.app/api`

## 인증

### 공개 API
진단 데이터 조회 API는 인증 없이 사용 가능합니다.

### 관리자 API
`/api/admin/*` 엔드포인트는 JWT 인증이 필요합니다.

```http
Authorization: Bearer <token>
```

---

## 공개 API

### 헬스 체크

서버 상태를 확인합니다.

```http
GET /api/health
```

**응답**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T12:00:00.000Z"
}
```

---

### 리더십 유형 조회

모든 리더십 유형 정보를 조회합니다.

```http
GET /api/leadership
```

**응답**
```json
{
  "leadershipTypes": {
    "L01": {
      "type": "L01",
      "name": "성장형",
      "title": "도전을 즐기는 성장형 리더",
      "description": "...",
      "strengths": ["강점1", "강점2"],
      "challenges": ["도전1", "도전2"],
      "image": "/images/leadership/L01.png"
    }
  }
}
```

---

### 팔로워십 유형 조회

모든 팔로워십 유형 정보를 조회합니다.

```http
GET /api/followership
```

**응답**
```json
{
  "followershipTypes": {
    "F01": {
      "type": "F01",
      "name": "Driver",
      "title": "추진형",
      "description": "...",
      "icon": "🚀"
    }
  }
}
```

---

### 고민 키워드 조회

진단에 사용되는 고민 키워드 목록을 조회합니다.

```http
GET /api/concerns
```

**응답**
```json
{
  "concerns": [
    {
      "id": "1",
      "label": "팀원 동기부여",
      "categories": ["motivation", "team"],
      "groupName": "팀 관리"
    }
  ]
}
```

---

### 질문 목록 조회

진단 질문 목록을 조회합니다.

```http
GET /api/questions
```

**응답**
```json
{
  "questions": [
    {
      "id": 1,
      "text": "질문 내용",
      "category": "growth",
      "subcategory": "g1_실패학습"
    }
  ]
}
```

---

### 솔루션 조회

리더십-고민 조합별 솔루션을 조회합니다.

```http
GET /api/solutions
```

**응답**
```json
{
  "solutions": {
    "L01_C01": {
      "id": "L01_C01",
      "combination": "성장형 + 동기부여",
      "title": "솔루션 제목",
      "coreIssue": "핵심 이슈",
      "diagnosis": "진단 내용",
      "actions": [
        {
          "title": "액션 제목",
          "method": "방법",
          "effect": "효과",
          "leadershipTip": "리더십 팁"
        }
      ]
    }
  }
}
```

---

### 진단 데이터 저장

진단 데이터를 Google Sheets에 저장합니다.

```http
POST /api/assessments
Content-Type: application/json
```

**요청 본문**
```json
{
  "id": "uuid-session-id",
  "status": "diagnosis",
  "answers": { "1": 5, "2": 4 },
  "nickname": "사용자명",
  "company": "회사명",
  "email": "user@example.com"
}
```

**응답**
```json
{
  "success": true,
  "id": "uuid-session-id"
}
```

---

### 서비스 신청

케어 서비스를 신청합니다.

```http
POST /api/service-request
Content-Type: application/json
```

**요청 본문**
```json
{
  "id": "uuid-session-id",
  "nickname": "사용자명",
  "email": "user@example.com",
  "company": "회사명",
  "department": "부서명",
  "jobRole": "직무",
  "leadershipType": "L01",
  "services": ["team_diagnosis_link", "expert_consultation"]
}
```

**서비스 코드**
| 코드 | 설명 |
|------|------|
| `team_diagnosis_link` | 팀 진단 Link 발송 |
| `expert_consultation` | 전문가 1:1 상담 |
| `team_workshop` | 팀 마인드 케어 워크샵 |
| `team_solution` | 팀 이슈 케어 솔루션 |

**응답**
```json
{
  "success": true
}
```

---

## 관리자 API

### 로그인

관리자 인증 후 JWT 토큰을 발급받습니다.

```http
POST /api/admin/auth
Content-Type: application/json
```

**요청 본문**
```json
{
  "password": "관리자비밀번호"
}
```

**응답 (성공)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**응답 (실패)**
```json
{
  "error": "비밀번호가 올바르지 않습니다.",
  "remainingAttempts": 4
}
```

**Rate Limiting**
- 1분당 5회 시도 제한
- 제한 초과 시 대기 시간 안내

---

### 콘텐츠 조회

관리자용 콘텐츠 데이터를 조회합니다.

```http
GET /api/admin/content?type=leadership
Authorization: Bearer <token>
```

**쿼리 파라미터**
| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `type` | ✅ | 콘텐츠 유형 |

**콘텐츠 유형**
- `leadership` - 리더십 유형
- `followership` - 팔로워십 유형
- `compatibility` - 궁합 정보
- `questions` - 진단 질문
- `concerns` - 고민 키워드
- `solutions` - 솔루션
- `actions` - 솔루션 액션

**응답**
```json
{
  "data": [...],
  "isStatic": false
}
```

- `isStatic: true` - 정적 데이터 사용 중 (DB 미설정)
- `isStatic: false` - 데이터베이스 데이터 사용 중

---

### 콘텐츠 생성

새로운 콘텐츠를 생성합니다.

```http
POST /api/admin/content
Authorization: Bearer <token>
Content-Type: application/json
```

**요청 본문**
```json
{
  "type": "leadership",
  "data": {
    "code": "L09",
    "name": "새로운 유형",
    "title": "새로운 리더십 유형",
    "description": "설명...",
    "strengths": ["강점1", "강점2"],
    "challenges": ["도전1", "도전2"]
  }
}
```

---

### 콘텐츠 수정

기존 콘텐츠를 수정합니다.

```http
PUT /api/admin/content
Authorization: Bearer <token>
Content-Type: application/json
```

**요청 본문**
```json
{
  "type": "leadership",
  "id": 1,
  "data": {
    "name": "수정된 이름"
  }
}
```

---

### 콘텐츠 삭제

콘텐츠를 삭제합니다.

```http
DELETE /api/admin/content?type=leadership&id=1
Authorization: Bearer <token>
```

---

## 설정 API

### 시트 헤더 업데이트

Google Sheets 헤더를 업데이트합니다 (관리자용).

```http
PUT /api/assessments?key=<ADMIN_SHEET_KEY>&action=headers
```

**쿼리 파라미터**
| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `key` | ✅ | 관리자 시트 키 (환경변수) |
| `action` | ❌ | `headers` 또는 `notes` |

---

## 에러 응답

모든 API는 일관된 에러 형식을 사용합니다.

```json
{
  "error": "에러 메시지",
  "details": "상세 정보 (선택)"
}
```

**HTTP 상태 코드**
| 코드 | 설명 |
|------|------|
| `200` | 성공 |
| `400` | 잘못된 요청 (입력 검증 실패) |
| `401` | 인증 필요 |
| `403` | 권한 없음 |
| `404` | 리소스 없음 |
| `409` | 충돌 (중복 등) |
| `429` | Rate Limit 초과 |
| `500` | 서버 에러 |
| `503` | 서비스 불가 (DB 미설정) |

---

## 환경변수

API 동작에 필요한 환경변수:

```bash
# Google Sheets API
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
# 또는
GOOGLE_PRIVATE_KEY_BASE64=...

# 인증
JWT_SECRET=... (최소 32자)
ADMIN_PASSWORD_HASH=...
ADMIN_SHEET_KEY=...

# 데이터베이스 (선택)
DATABASE_URL=...
```
