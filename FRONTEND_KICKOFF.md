# 프론트엔드 개발 시작 가이드

## 백엔드 API 정보

### Base URL
```
https://tarot-production-ed3e.up.railway.app
```

### API 문서
```
https://tarot-production-ed3e.up.railway.app/api-docs
```

### 인증 방식
- JWT Bearer Token
- Header: `Authorization: Bearer <token>`

---

## 주요 API 엔드포인트

### 인증 (Authentication)
```typescript
// 회원가입
POST /api/v1/auth/register
Body: { username, email, password, displayName }
Response: { token, user }

// 로그인
POST /api/v1/auth/login
Body: { email, password }
Response: { token, user }

// 내 정보
GET /api/v1/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

### 타로 카드 & 스프레드
```typescript
// 카드 목록
GET /api/v1/cards
Response: { success, count, data: Card[] }

// 스프레드 목록
GET /api/v1/spreads
Response: { success, count, data: Spread[] }

// 스프레드 상세
GET /api/v1/spreads/:id
Response: { success, data: Spread }
```

### 타로 리딩
```typescript
// 리딩 생성
POST /api/v1/readings
Headers: { Authorization: Bearer <token> }
Body: {
  question: string,
  questionCategory: 'love' | 'career' | 'spiritual' | 'general' | 'health',
  spreadId: string
}
Response: { success, data: Reading }

// 내 리딩 목록
GET /api/v1/readings
Headers: { Authorization: Bearer <token> }
Response: { success, count, data: Reading[] }

// 리딩 상세
GET /api/v1/readings/:id
Headers: { Authorization: Bearer <token> }
Response: { success, data: Reading }
```

### 공개 리딩 & 소셜 (Phase 6)
```typescript
// 공개 리딩 피드
GET /api/v1/readings/public?sort=recent&limit=10
Response: { success, count, data: Reading[], pagination }

// 공유된 리딩 보기
GET /api/v1/readings/shared/:id
Response: { success, data: Reading }

// 리딩 공개/비공개 전환
PUT /api/v1/readings/:id/visibility
Headers: { Authorization: Bearer <token> }
Body: { isPublic: boolean }

// 좋아요
POST /api/v1/readings/:id/like
Headers: { Authorization: Bearer <token> }

// 좋아요 취소
DELETE /api/v1/readings/:id/like
Headers: { Authorization: Bearer <token> }

// 댓글 작성
POST /api/v1/readings/:id/comments
Headers: { Authorization: Bearer <token> }
Body: { content: string }

// 댓글 목록
GET /api/v1/readings/:id/comments
Response: { success, count, data: Comment[] }
```

### 사용자 대시보드 (Phase 6)
```typescript
// 종합 대시보드
GET /api/v1/users/dashboard
Headers: { Authorization: Bearer <token> }
Response: {
  totalReadings,
  favoriteReadings,
  publicReadings,
  totalViews,
  totalLikes,
  totalComments,
  topCards,
  monthlyTrend,
  recentReadings
}

// 카테고리별 통계
GET /api/v1/users/dashboard/categories
Headers: { Authorization: Bearer <token> }

// 카드 빈도 분석
GET /api/v1/users/dashboard/cards?limit=20
Headers: { Authorization: Bearer <token> }

// 시간대별 패턴
GET /api/v1/users/dashboard/patterns
Headers: { Authorization: Bearer <token> }
```

### 리딩 내보내기 (Phase 6)
```typescript
// PDF 내보내기
GET /api/v1/users/export?format=pdf
Headers: { Authorization: Bearer <token> }
Response: Binary (PDF file)

// CSV 내보내기
GET /api/v1/users/export?format=csv
Headers: { Authorization: Bearer <token> }
Response: Text (CSV file)

// JSON 내보내기
GET /api/v1/users/export?format=json
Headers: { Authorization: Bearer <token> }
Response: JSON (readings array)
```

---

## TypeScript 타입 정의

### User
```typescript
interface User {
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
    mostCommonQuestionCategory?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Card
```typescript
interface Card {
  _id: string;
  nameShort: string;  // "AR00", "CU01"
  name: string;       // "The Fool", "Ace of Cups"
  nameKo: string;     // "광대", "컵 에이스"
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number: number;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  imageUrl?: string;
}
```

### Spread
```typescript
interface Spread {
  _id: string;
  name: string;      // "Single Card"
  nameKo: string;    // "원카드"
  description: string;
  descriptionKo: string;
  cardCount: number;
  positions: Array<{
    position: number;
    name: string;
    nameKo: string;
    meaning: string;
    meaningKo: string;
  }>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
}
```

### Reading
```typescript
interface Reading {
  _id: string;
  user: string;
  spread: Spread;
  question: string;
  questionCategory: 'love' | 'career' | 'spiritual' | 'general' | 'health';
  cardsDrawn: Array<{
    card: Card;
    position: number;
    orientation: 'upright' | 'reversed';
    interpretation?: string;
  }>;
  interpretation?: string;
  rating?: number;
  isFavorite: boolean;
  
  // Phase 6: Social features
  isPublic: boolean;
  viewsCount: number;
  sharesCount: number;
  likesCount: number;
  commentsCount: number;
  
  createdAt: string;
  updatedAt: string;
}
```

### Comment
```typescript
interface Comment {
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
  createdAt: string;
  updatedAt: string;
}
```

---

## 권장 기술 스택

### Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand or React Context
- **API Client:** Axios or Fetch

### UI Components
- **Component Library:** shadcn/ui
- **Icons:** lucide-react
- **Animations:** framer-motion
- **Charts:** recharts or Chart.js

### Forms & Validation
- **Forms:** react-hook-form
- **Validation:** zod

### Authentication
- **JWT Storage:** localStorage or httpOnly cookies
- **Auth Provider:** React Context

---

## 페이지 구조 제안

```
/
├── (auth)
│   ├── login
│   └── register
├── dashboard
│   ├── overview
│   ├── readings
│   ├── analytics
│   └── settings
├── readings
│   ├── new
│   ├── [id]
│   └── public
├── cards
│   └── [id]
├── spreads
│   └── [id]
└── profile
    └── [username]
```

---

## 주요 기능 구현 순서

### Phase 1: 기본 설정 (1일)
1. Next.js 프로젝트 초기화
2. TypeScript 설정
3. Tailwind CSS 설정
4. shadcn/ui 설치
5. API client 설정
6. 환경변수 설정

### Phase 2: 인증 (2일)
1. 로그인 페이지
2. 회원가입 페이지
3. JWT 토큰 관리
4. Protected Routes
5. Auth Context

### Phase 3: 타로 리딩 (3일)
1. 카드 목록 페이지
2. 스프레드 선택 페이지
3. 리딩 생성 폼
4. 리딩 결과 표시
5. 리딩 목록

### Phase 4: 대시보드 (2일)
1. 통계 대시보드
2. 차트 및 그래프
3. 최근 리딩 목록
4. 카드 빈도 분석

### Phase 5: 소셜 기능 (3일)
1. 공개 리딩 피드
2. 좋아요 기능
3. 댓글 시스템
4. 공유 기능

### Phase 6: 추가 기능 (2일)
1. 리딩 내보내기
2. 프로필 관리
3. 설정 페이지
4. 모바일 최적화

---

## 환경변수 설정

```env
# .env.local
NEXT_PUBLIC_API_URL=https://tarot-production-ed3e.up.railway.app
NEXT_PUBLIC_API_VERSION=v1
```

---

## API Client 예시

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
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
```

---

## 다음 단계

1. ✅ 백엔드 API 정보 확인
2. ✅ 타입 정의 검토
3. ⬜ 새 프로젝트 생성 (Next.js)
4. ⬜ 기본 설정 완료
5. ⬜ 인증 시스템 구현
6. ⬜ 타로 리딩 UI 구현

---

**백엔드 API 준비 완료!** 프론트엔드 개발을 시작하세요! 🚀
