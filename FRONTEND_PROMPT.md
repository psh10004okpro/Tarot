# Unwoldam Studio Tarot 웹 애플리케이션 개발

## 프로젝트 개요

**Unwoldam Studio Tarot**의 프론트엔드 웹 애플리케이션을 개발합니다. 이는 AI 기반 타로 카드 리딩 서비스로, 사용자가 질문을 입력하면 Claude AI가 타로 카드를 해석하여 인사이트를 제공합니다.

**백엔드 API는 이미 완성되어 배포된 상태**이며, 프론트엔드만 개발하면 됩니다.

---

## 백엔드 API 정보

### 기본 정보
- **Production URL:** `https://tarot-production-ed3e.up.railway.app`
- **API Base Path:** `/api/v1`
- **API 문서:** `https://tarot-production-ed3e.up.railway.app/api-docs`
- **인증 방식:** JWT Bearer Token
- **Header 형식:** `Authorization: Bearer <token>`

### 현재 데이터베이스 상태
```
✅ 타로 카드: 22개 (Major Arcana 전체)
✅ 스프레드: 5개 (원카드, 쓰리카드, 연애, 커리어, 켈틱크로스)
✅ 테스트 사용자: 2명
   - testuser / test@unwoldam.com / password123
   - admin / admin@unwoldam.com / admin123
```

---

## 기술 스택 (권장)

### 필수
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **State Management:** Zustand 또는 React Context
- **HTTP Client:** axios

### 권장
- **Form:** react-hook-form
- **Validation:** zod
- **Icons:** lucide-react
- **Animation:** framer-motion
- **Charts:** recharts (대시보드용)
- **Date:** date-fns

---

## 주요 기능

### Phase 1: 인증 & 기본 기능
1. **회원가입/로그인** - JWT 토큰 기반 인증
2. **타로 카드 조회** - 22개 Major Arcana 카드 정보
3. **스프레드 선택** - 5가지 타로 스프레드
4. **리딩 생성** - 질문 입력 → AI 해석 받기
5. **내 리딩 목록** - 과거 리딩 기록 조회

### Phase 2: 소셜 & 커뮤니티 (Phase 6 백엔드 기능)
1. **공개 리딩 피드** - 다른 사용자의 공개 리딩 보기
2. **좋아요** - 리딩에 좋아요 표시
3. **댓글** - 리딩에 댓글 작성/수정/삭제
4. **공유** - 리딩을 공개/비공개로 전환

### Phase 3: 대시보드 & 분석
1. **사용자 대시보드** - 통계 및 인사이트
2. **카드 빈도 분석** - 자주 나온 카드 차트
3. **월별 추이** - 리딩 패턴 분석
4. **카테고리별 통계** - 질문 카테고리 분포

### Phase 4: 고급 기능
1. **리딩 내보내기** - PDF/CSV/JSON 다운로드
2. **즐겨찾기** - 중요한 리딩 북마크
3. **프로필 관리** - 사용자 정보 수정
4. **다크모드** - 테마 전환

---

## API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```typescript
POST /api/v1/auth/register
Content-Type: application/json

Request Body:
{
  "username": "string",      // 3-30자
  "email": "string",         // 이메일 형식
  "password": "string",      // 최소 6자
  "displayName": "string"    // 선택
}

Response (201):
{
  "success": true,
  "data": {
    "user": { /* User 객체 */ },
    "token": "jwt_token_here"
  }
}
```

#### 로그인
```typescript
POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { /* User 객체 */ },
    "token": "jwt_token_here"
  }
}
```

#### 내 정보 조회
```typescript
GET /api/v1/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { /* User 객체 */ }
}
```

---

### 타로 카드 (Cards)

#### 카드 목록
```typescript
GET /api/v1/cards

Response (200):
{
  "success": true,
  "count": 22,
  "data": [
    {
      "_id": "string",
      "nameShort": "AR00",
      "name": "The Fool",
      "nameKo": "광대",
      "arcana": "Major",
      "number": 0,
      "meaningUpright": ["새로운 시작", "순수함", ...],
      "meaningReversed": ["무모함", "위험한 행동", ...],
      "keywordsUpright": ["시작", "모험", ...],
      "keywordsReversed": ["무모", "경솔", ...],
      "descriptionShort": "string",
      "descriptionLong": "string",
      "symbolism": ["백장미", "작은 개", ...],
      "questionsToAsk": ["string", ...],
      "affirmation": "string",
      "fortunetellingKo": ["string", ...],
      // ... 기타 필드
    }
  ]
}
```

#### 카드 상세
```typescript
GET /api/v1/cards/:id

Response (200):
{
  "success": true,
  "data": { /* Card 객체 */ }
}
```

---

### 타로 스프레드 (Spreads)

#### 스프레드 목록
```typescript
GET /api/v1/spreads

Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "string",
      "name": "Single Card",
      "nameKo": "원 카드",
      "description": "string",
      "cardCount": 1,
      "difficulty": "beginner" | "intermediate" | "advanced",
      "category": "general" | "love" | "career",
      "positions": [
        {
          "position": 1,
          "name": "The Card",
          "nameKo": "카드",
          "description": "string",
          "interpretationGuide": "string"
        }
      ],
      "isPremium": false,
      "isActive": true
    }
  ]
}
```

---

### 타로 리딩 (Readings)

#### 리딩 생성 (중요!)
```typescript
POST /api/v1/readings
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "question": "string",                    // 질문 내용
  "questionCategory": "love" | "career" | "spiritual" | "general" | "health",
  "spreadId": "string"                     // 스프레드 ID
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "string",
    "user": "userId",
    "spread": { /* Spread 객체 */ },
    "question": "string",
    "questionCategory": "general",
    "cardsDrawn": [
      {
        "card": { /* Card 객체 */ },
        "position": 1,
        "orientation": "upright" | "reversed",
        "interpretation": "Claude AI의 카드별 해석"
      }
    ],
    "interpretation": "Claude AI의 종합 해석",  // 전체 리딩 해석
    "rating": null,
    "isFavorite": false,
    "isPublic": false,
    "viewsCount": 0,
    "sharesCount": 0,
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}

// 중요: interpretation 필드에 Claude AI가 생성한 타로 해석이 들어있습니다!
```

#### 내 리딩 목록
```typescript
GET /api/v1/readings
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 10)
  - page: number (default: 1)
  - category: string
  - isFavorite: boolean

Response (200):
{
  "success": true,
  "count": 10,
  "data": [ /* Reading 객체 배열 */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 리딩 상세
```typescript
GET /api/v1/readings/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { /* Reading 객체 */ }
}
```

#### 리딩 수정
```typescript
PUT /api/v1/readings/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "rating": 1-5,           // 선택
  "isFavorite": boolean,   // 선택
  "notes": "string"        // 선택 (메모)
}
```

#### 리딩 삭제
```typescript
DELETE /api/v1/readings/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Reading deleted successfully"
}
```

---

### 공개 리딩 & 소셜 (Phase 6)

#### 공개 리딩 피드
```typescript
GET /api/v1/readings/public
Query Parameters:
  - sort: "recent" | "popular" | "liked" (default: "recent")
  - limit: number (default: 10)
  - page: number

Response (200):
{
  "success": true,
  "count": 10,
  "data": [ /* Reading 객체 배열 */ ],
  "pagination": { /* Pagination 객체 */ }
}
```

#### 공유된 리딩 보기
```typescript
GET /api/v1/readings/shared/:id

Response (200):
{
  "success": true,
  "data": { /* Reading 객체 (조회수 +1) */ }
}
```

#### 리딩 공개/비공개 전환
```typescript
PUT /api/v1/readings/:id/visibility
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "isPublic": boolean
}
```

#### 좋아요 추가
```typescript
POST /api/v1/readings/:id/like
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Reading liked successfully"
}
```

#### 좋아요 취소
```typescript
DELETE /api/v1/readings/:id/like
Authorization: Bearer <token>
```

#### 좋아요 상태 확인
```typescript
GET /api/v1/readings/:id/like/status
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "isLiked": boolean
  }
}
```

#### 댓글 작성
```typescript
POST /api/v1/readings/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "content": "string"  // 최대 500자
}

Response (201):
{
  "success": true,
  "data": { /* Comment 객체 */ }
}
```

#### 댓글 목록
```typescript
GET /api/v1/readings/:id/comments

Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "string",
      "reading": "readingId",
      "user": {
        "_id": "userId",
        "username": "string",
        "profile": {
          "displayName": "string",
          "avatarUrl": "string"
        }
      },
      "content": "string",
      "likesCount": 0,
      "isEdited": false,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

#### 댓글 수정
```typescript
PUT /api/v1/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "content": "string"
}
```

#### 댓글 삭제
```typescript
DELETE /api/v1/comments/:id
Authorization: Bearer <token>
```

---

### 사용자 대시보드 (Phase 6)

#### 종합 대시보드
```typescript
GET /api/v1/users/dashboard
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "summary": {
      "totalReadings": 42,
      "favoriteReadings": 8,
      "publicReadings": 12,
      "totalViews": 156,
      "totalLikes": 45,
      "totalComments": 23
    },
    "topCards": [
      {
        "_id": "cardId",
        "cardInfo": { /* Card 객체 */ },
        "count": 5,
        "upright": 3,
        "reversed": 2,
        "percentage": 11.9
      }
    ],
    "monthlyTrend": [
      {
        "_id": { "year": 2025, "month": 10 },
        "count": 12,
        "yearMonth": "2025-10"
      }
    ],
    "recentReadings": [ /* Reading 객체 배열 (최근 5개) */ ]
  }
}
```

#### 카테고리별 통계
```typescript
GET /api/v1/users/dashboard/categories
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "love",
      "count": 15,
      "avgRating": 4.2,
      "percentage": 35.7
    }
  ]
}
```

#### 카드 빈도 분석
```typescript
GET /api/v1/users/dashboard/cards
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 10)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "cardId",
      "cardInfo": { /* Card 객체 */ },
      "count": 8,
      "upright": 5,
      "reversed": 3,
      "percentage": 19.0
    }
  ]
}
```

#### 시간대별 패턴
```typescript
GET /api/v1/users/dashboard/patterns
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "byDayOfWeek": [
      { "_id": 0, "day": "Sunday", "count": 3 },
      { "_id": 1, "day": "Monday", "count": 8 }
    ],
    "byHourOfDay": [
      { "_id": 9, "hour": "09:00", "count": 2 },
      { "_id": 14, "hour": "14:00", "count": 5 }
    ]
  }
}
```

---

### 리딩 내보내기 (Phase 6)

#### PDF 내보내기
```typescript
GET /api/v1/users/export?format=pdf
Authorization: Bearer <token>

Response (200):
Content-Type: application/pdf
Content-Disposition: attachment; filename=tarot-readings-{timestamp}.pdf

// Binary PDF file
```

#### CSV 내보내기
```typescript
GET /api/v1/users/export?format=csv
Authorization: Bearer <token>

Response (200):
Content-Type: text/csv

// CSV 파일
```

#### JSON 내보내기
```typescript
GET /api/v1/users/export?format=json
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [ /* Reading 객체 배열 */ ]
}
```

---

## TypeScript 타입 정의

```typescript
// types/index.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    displayName?: string;
    birthDate?: string;
    birthTime?: string;
    zodiacSign?: string;
    bio?: string;
    avatarUrl?: string;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    credits: number;
    expiresAt?: string;
  };
  preferences: {
    language: 'ko' | 'en';
    notificationEnabled: boolean;
    emailNotifications?: boolean;
    favoriteDeck: string;
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  stats: {
    totalReadings: number;
    favoriteCards: Array<{
      card: string;
      count: number;
    }>;
    mostCommonQuestionCategory?: 'love' | 'career' | 'spiritual' | 'general' | 'health';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  nameShort: string;       // "AR00", "AR01", ...
  name: string;            // "The Fool", "The Magician", ...
  nameKo: string;          // "광대", "마법사", ...
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | null;
  number: number;
  meaningUpright: string[];
  meaningReversed: string[];
  keywordsUpright: string[];
  keywordsReversed: string[];
  descriptionShort: string;
  descriptionLong: string;
  element?: string | null;
  symbolism: string[];
  questionsToAsk: string[];
  affirmation: string;
  fortunetellingKo: string[];
  relatedHanja?: string;
  astrology?: string;
  numerology?: string;
  isActive: boolean;
}

export interface SpreadPosition {
  position: number;
  name: string;
  nameKo: string;
  description: string;
  interpretationGuide: string;
}

export interface Spread {
  _id: string;
  name: string;
  nameKo: string;
  description: string;
  cardCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'general' | 'love' | 'career';
  positions: SpreadPosition[];
  isPremium: boolean;
  isActive: boolean;
}

export interface CardDrawn {
  card: Card;
  position: number;
  orientation: 'upright' | 'reversed';
  interpretation?: string;  // Claude AI의 개별 카드 해석
}

export interface Reading {
  _id: string;
  user: string | User;
  spread: Spread;
  question: string;
  questionCategory: 'love' | 'career' | 'spiritual' | 'general' | 'health';
  cardsDrawn: CardDrawn[];
  interpretation?: string;   // Claude AI의 전체 리딩 해석
  rating?: number;           // 1-5
  isFavorite: boolean;
  notes?: string;

  // Phase 6: Social features
  isPublic: boolean;
  viewsCount: number;
  sharesCount: number;
  likesCount: number;
  commentsCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  reading: string;
  user: {
    _id: string;
    username: string;
    profile: {
      displayName?: string;
      avatarUrl?: string;
    };
  };
  content: string;
  likesCount: number;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalReadings: number;
  favoriteReadings: number;
  publicReadings: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface TopCard {
  _id: string;
  cardInfo: Card;
  count: number;
  upright: number;
  reversed: number;
  percentage: number;
}

export interface MonthlyTrend {
  _id: {
    year: number;
    month: number;
  };
  count: number;
  yearMonth: string;
}

export interface CategoryStat {
  _id: string;
  count: number;
  avgRating: number;
  percentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  pagination: PaginationMeta;
}
```

---

## 페이지 구조

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # 로그인 페이지
│   └── register/
│       └── page.tsx              # 회원가입 페이지
│
├── (main)/
│   ├── layout.tsx                # 메인 레이아웃 (네비게이션)
│   ├── page.tsx                  # 홈 페이지 (랜딩)
│   │
│   ├── cards/
│   │   ├── page.tsx              # 카드 목록
│   │   └── [id]/
│   │       └── page.tsx          # 카드 상세
│   │
│   ├── spreads/
│   │   ├── page.tsx              # 스프레드 목록
│   │   └── [id]/
│   │       └── page.tsx          # 스프레드 상세
│   │
│   ├── readings/
│   │   ├── page.tsx              # 내 리딩 목록
│   │   ├── new/
│   │   │   └── page.tsx          # 새 리딩 생성
│   │   ├── [id]/
│   │   │   └── page.tsx          # 리딩 상세
│   │   └── public/
│   │       └── page.tsx          # 공개 리딩 피드
│   │
│   ├── dashboard/
│   │   ├── page.tsx              # 대시보드 홈
│   │   ├── analytics/
│   │   │   └── page.tsx          # 분석 & 통계
│   │   └── settings/
│   │       └── page.tsx          # 설정
│   │
│   └── profile/
│       └── page.tsx              # 프로필 관리
│
└── api/                          # API route handlers (선택)
    └── auth/
        └── [...nextauth].ts      # NextAuth (선택)
```

---

## 구현 우선순위

### 🚀 Phase 1: MVP (2-3일)

**목표:** 기본적인 타로 리딩 기능 구현

1. **프로젝트 초기화**
   ```bash
   npx create-next-app@latest tarot-frontend
   # TypeScript, Tailwind, App Router 선택

   npm install axios zustand react-hook-form zod
   npx shadcn-ui@latest init
   ```

2. **환경 설정**
   ```env
   # .env.local
   NEXT_PUBLIC_API_URL=https://tarot-production-ed3e.up.railway.app
   ```

3. **API 클라이언트 설정**
   - axios 인스턴스 생성
   - 인터셉터 설정 (토큰 자동 추가)
   - 에러 핸들링

4. **인증 시스템**
   - 로그인 페이지
   - 회원가입 페이지
   - JWT 토큰 관리 (localStorage)
   - Protected Routes

5. **타로 리딩 핵심 기능**
   - 스프레드 선택 페이지
   - 질문 입력 폼
   - 리딩 결과 표시
   - 카드 애니메이션

6. **내 리딩 목록**
   - 리딩 목록 조회
   - 페이지네이션
   - 필터링 (카테고리별)

### 🎨 Phase 2: UI/UX 개선 (1-2일)

1. **디자인 시스템**
   - shadcn/ui 컴포넌트 설치
   - 색상 팔레트 정의
   - 타이포그래피

2. **카드 표시**
   - 카드 목록 페이지
   - 카드 상세 페이지
   - 카드 뒤집기 애니메이션

3. **레이아웃**
   - 네비게이션 바
   - 푸터
   - 반응형 디자인

### 💬 Phase 3: 소셜 기능 (2일)

1. **공개 리딩 피드**
   - 공개 리딩 목록
   - 정렬 (최신순/인기순)
   - 무한 스크롤

2. **상호작용**
   - 좋아요 버튼
   - 댓글 작성/수정/삭제
   - 리딩 공유 버튼

### 📊 Phase 4: 대시보드 (2일)

1. **통계 대시보드**
   - 종합 요약 카드
   - 카드 빈도 차트 (recharts)
   - 월별 추이 그래프
   - 카테고리 분포 도넛 차트

2. **데이터 시각화**
   - 시간대별 패턴
   - 요일별 패턴

### ⚙️ Phase 5: 추가 기능 (1-2일)

1. **리딩 관리**
   - 즐겨찾기
   - 평점 주기
   - 메모 추가
   - 삭제

2. **내보내기**
   - PDF 다운로드
   - CSV 다운로드
   - JSON 다운로드

3. **프로필 & 설정**
   - 프로필 정보 수정
   - 비밀번호 변경
   - 알림 설정

---

## 디자인 가이드라인

### 색상 팔레트 (제안)

```css
/* 신비로운 타로 테마 */
--primary: 280 65% 60%;        /* 보라 (신비) */
--secondary: 45 93% 58%;       /* 금색 (신성) */
--accent: 340 75% 55%;         /* 자주색 (영성) */

--background: 240 10% 3.9%;    /* 거의 검정 */
--foreground: 0 0% 98%;        /* 거의 흰색 */

--card: 240 10% 7%;            /* 카드 배경 */
--card-foreground: 0 0% 98%;

--muted: 240 3.7% 15.9%;
--muted-foreground: 240 5% 64.9%;

--border: 240 3.7% 15.9%;
```

### 타이포그래피

```typescript
// fonts/index.ts
import { Inter, Cinzel } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });  // 본문
export const cinzel = Cinzel({ subsets: ['latin'] }); // 제목 (고전적)
```

### 주요 컴포넌트 예시

#### 카드 컴포넌트
```typescript
// components/TarotCard.tsx
interface TarotCardProps {
  card: Card;
  orientation: 'upright' | 'reversed';
  isFlipped: boolean;
  onFlip?: () => void;
}

// 카드 앞면: 카드 이미지 또는 이름
// 카드 뒷면: 타로 카드 패턴
// 애니메이션: framer-motion으로 뒤집기 효과
```

#### 리딩 결과 카드
```typescript
// components/ReadingResult.tsx
interface ReadingResultProps {
  reading: Reading;
}

// 표시 내용:
// - 질문
// - 뽑힌 카드들 (orientation 포함)
// - 각 카드별 해석 (interpretation)
// - 전체 리딩 해석 (reading.interpretation)
// - 소셜 버튼 (좋아요, 댓글, 공유)
```

---

## API 클라이언트 예시

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 에러 처리
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API 함수들
export const authApi = {
  register: (data: RegisterData) => api.post('/api/v1/auth/register', data),
  login: (data: LoginData) => api.post('/api/v1/auth/login', data),
  getMe: () => api.get('/api/v1/auth/me'),
};

export const cardApi = {
  getAll: () => api.get<ApiResponse<Card[]>>('/api/v1/cards'),
  getById: (id: string) => api.get<ApiResponse<Card>>(`/api/v1/cards/${id}`),
};

export const spreadApi = {
  getAll: () => api.get<ApiResponse<Spread[]>>('/api/v1/spreads'),
  getById: (id: string) => api.get<ApiResponse<Spread>>(`/api/v1/spreads/${id}`),
};

export const readingApi = {
  create: (data: CreateReadingData) => api.post<ApiResponse<Reading>>('/api/v1/readings', data),
  getAll: (params?: GetReadingsParams) => api.get<PaginatedResponse<Reading>>('/api/v1/readings', { params }),
  getById: (id: string) => api.get<ApiResponse<Reading>>(`/api/v1/readings/${id}`),
  update: (id: string, data: UpdateReadingData) => api.put(`/api/v1/readings/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/readings/${id}`),

  // Public & Social
  getPublic: (params?: GetPublicReadingsParams) => api.get<PaginatedResponse<Reading>>('/api/v1/readings/public', { params }),
  getShared: (id: string) => api.get<ApiResponse<Reading>>(`/api/v1/readings/shared/${id}`),
  toggleVisibility: (id: string, isPublic: boolean) => api.put(`/api/v1/readings/${id}/visibility`, { isPublic }),
  like: (id: string) => api.post(`/api/v1/readings/${id}/like`),
  unlike: (id: string) => api.delete(`/api/v1/readings/${id}/like`),
  getLikeStatus: (id: string) => api.get(`/api/v1/readings/${id}/like/status`),
};

export const commentApi = {
  create: (readingId: string, content: string) => api.post(`/api/v1/readings/${readingId}/comments`, { content }),
  getAll: (readingId: string) => api.get<ApiResponse<Comment[]>>(`/api/v1/readings/${readingId}/comments`),
  update: (id: string, content: string) => api.put(`/api/v1/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/api/v1/comments/${id}`),
};

export const dashboardApi = {
  getSummary: () => api.get('/api/v1/users/dashboard'),
  getCategories: () => api.get('/api/v1/users/dashboard/categories'),
  getCards: (limit?: number) => api.get('/api/v1/users/dashboard/cards', { params: { limit } }),
  getPatterns: () => api.get('/api/v1/users/dashboard/patterns'),
};

export const exportApi = {
  exportPDF: () => api.get('/api/v1/users/export?format=pdf', { responseType: 'blob' }),
  exportCSV: () => api.get('/api/v1/users/export?format=csv', { responseType: 'blob' }),
  exportJSON: () => api.get('/api/v1/users/export?format=json'),
};
```

---

## 상태 관리 예시 (Zustand)

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

## 핵심 기능 구현 가이드

### 1. 리딩 생성 플로우

```typescript
// app/(main)/readings/new/page.tsx

1. 스프레드 선택
   - GET /api/v1/spreads
   - 사용자가 스프레드 선택 (예: 원카드, 쓰리카드 등)

2. 질문 입력
   - 질문 내용 입력
   - 카테고리 선택 (love, career, general 등)

3. 리딩 생성
   - POST /api/v1/readings
   - Request: { question, questionCategory, spreadId }
   - Response: Reading 객체 (카드 + Claude AI 해석 포함!)

4. 결과 표시
   - 뽑힌 카드들 애니메이션으로 표시
   - 각 카드별 해석 (cardsDrawn[].interpretation)
   - 전체 리딩 해석 (reading.interpretation)
   - 저장/공유 버튼
```

### 2. 공개 리딩 피드

```typescript
// app/(main)/readings/public/page.tsx

1. 리딩 목록 조회
   - GET /api/v1/readings/public?sort=recent&limit=10
   - 정렬: recent (최신), popular (조회수), liked (좋아요)

2. 무한 스크롤
   - react-intersection-observer 사용
   - page 파라미터로 다음 페이지 로드

3. 리딩 카드 표시
   - 질문, 카테고리
   - 뽑힌 카드 썸네일
   - 좋아요/댓글 수
   - 작성자 정보

4. 상세 보기
   - 클릭 시 /readings/shared/:id로 이동
   - 조회수 자동 증가
```

### 3. 대시보드 차트

```typescript
// app/(main)/dashboard/page.tsx
import { BarChart, DonutChart, LineChart } from 'recharts';

1. 데이터 로드
   - GET /api/v1/users/dashboard

2. 카드 표시
   - 총 리딩 수
   - 좋아요 받은 수
   - 조회수

3. 차트
   - 카드 빈도: BarChart (topCards)
   - 월별 추이: LineChart (monthlyTrend)
   - 카테고리 분포: DonutChart (categories)
```

---

## 테스트 계정

프론트엔드 개발 중 테스트에 사용할 수 있는 계정:

```
일반 사용자:
- Email: test@unwoldam.com
- Password: password123

관리자:
- Email: admin@unwoldam.com
- Password: admin123
```

---

## 개발 시작하기

### 1단계: 프로젝트 초기화

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest tarot-frontend
# ✔ TypeScript? Yes
# ✔ ESLint? Yes
# ✔ Tailwind CSS? Yes
# ✔ src/ directory? No
# ✔ App Router? Yes
# ✔ Turbopack? Yes

cd tarot-frontend

# 의존성 설치
npm install axios zustand react-hook-form zod date-fns
npm install -D @types/node

# shadcn/ui 초기화
npx shadcn-ui@latest init
# ✔ Style: Default
# ✔ Base color: Slate
# ✔ CSS variables: Yes

# 필요한 컴포넌트 설치
npx shadcn-ui@latest add button card input label form dialog
```

### 2단계: 환경 설정

```bash
# .env.local 생성
echo 'NEXT_PUBLIC_API_URL=https://tarot-production-ed3e.up.railway.app' > .env.local
```

### 3단계: 기본 구조 생성

```bash
# 폴더 구조
mkdir -p app/\(auth\)/login app/\(auth\)/register
mkdir -p app/\(main\)/cards app/\(main\)/readings/new
mkdir -p lib stores types components
```

### 4단계: API 클라이언트 작성

위의 API 클라이언트 예시를 `lib/api.ts`에 작성

### 5단계: 타입 정의

위의 TypeScript 타입을 `types/index.ts`에 작성

### 6단계: 첫 페이지 구현

로그인 페이지부터 시작!

---

## 주의사항

1. **CORS는 이미 백엔드에서 설정됨** - 별도 설정 불필요
2. **JWT 토큰은 localStorage에 저장** - httpOnly 쿠키 미사용
3. **에러 처리** - 모든 API 호출에 try-catch 사용
4. **로딩 상태** - API 호출 중 로딩 인디케이터 표시
5. **반응형** - 모바일 우선 디자인
6. **접근성** - ARIA 레이블 사용

---

## 목표

**2주 내에 완성도 높은 타로 웹 애플리케이션 완성!**

- Week 1: MVP (인증 + 리딩 생성 + 목록)
- Week 2: 소셜 기능 + 대시보드 + UI 개선

---

## 참고 자료

- **API 문서:** https://tarot-production-ed3e.up.railway.app/api-docs
- **Next.js 문서:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**이제 타로 웹 애플리케이션을 만들어보세요!** 🔮✨

백엔드 API가 완벽하게 준비되어 있으니, 프론트엔드 개발에만 집중하면 됩니다. Claude Code를 사용하여 단계별로 구현해나가세요!
