# Unwoldam Tarot 프론트엔드 개발 - 백엔드 API 정보

## 📌 기본 정보

### API 서버
```
Production URL: https://tarot-production-ed3e.up.railway.app
API Base Path: /api/v1
API 문서: https://tarot-production-ed3e.up.railway.app/api-docs
```

### 인증 방식
```
Type: JWT Bearer Token
Header: Authorization: Bearer <token>
```

### 현재 배포 상태
```
✅ 78장 타로 카드 (메이저 22장 + 마이너 56장)
✅ JSON 기반 시스템 (데이터베이스 불필요)
✅ 한국어 해석 포함
✅ 최신 배포 완료 (2025-10-28)
```

---

## 🎴 타로 카드 데이터 구조

### Card Model (TypeScript Interface)
```typescript
interface Card {
  // 식별 정보
  card: string;                    // "0. THE FOOL / 바보(광대) / 메이저 아르카나"
  nameShort: string;               // "AR00", "CU01", "SW14" 등
  name: string;                    // "THE FOOL", "ACE of CUPS" 등
  nameKo: string;                  // "바보(광대)", "컵에이스" 등
  arcana: 'Major' | 'Minor';       // 메이저 or 마이너 아르카나
  suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | null;
  number: number;                  // 0-78

  // 비주얼
  imageDescription: string;        // 카드 이미지 설명 (한국어)
  imageUrl?: string;               // 카드 이미지 URL (선택)

  // 키워드
  keywords: string[];              // ["자유로운", "무계획적인", ...]

  // 해석 (모두 한국어)
  love: string;                    // 연애운
  relationship: string;            // 인간관계
  finance: string;                 // 금전운
  educationCareerBusiness: string; // 학업/직업/사업
  reunion: string;                 // 재회
  contract: string;                // 계약
  travelMoving: string;            // 여행/이동
  jobChange: string;               // 이직
  health: string;                  // 건강
  places: string;                  // 장소
  mood: string;                    // 기분/감정

  // 상징과 조언
  numerology: string;              // 숫자학적 의미
  symbolism: string;               // 상징 해석
  advice: string;                  // 조언
  caution: string;                 // 주의사항

  // 메타데이터
  isActive: boolean;               // 활성화 여부
  createdAt: string;               // 생성일
  updatedAt: string;               // 수정일
}
```

---

## 🔌 주요 API 엔드포인트

### 1. 타로 카드 API

#### 모든 카드 조회
```http
GET /api/v1/cards
Query Parameters:
  - arcana: 'Major' | 'Minor' (선택)
  - suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles' (선택)
  - page: number (기본값: 1)
  - limit: number (기본값: 78)

Response:
{
  "success": true,
  "count": 78,
  "pagination": {
    "page": 1,
    "limit": 78,
    "total": 78,
    "pages": 1
  },
  "data": Card[]
}
```

#### 특정 카드 조회
```http
GET /api/v1/cards/:id
Parameters:
  - id: nameShort (예: "AR00", "CU01")

Response:
{
  "success": true,
  "data": Card
}
```

#### 카드 검색
```http
GET /api/v1/cards/search
Query Parameters:
  - q: string (검색어, 필수)
  - page: number
  - limit: number

Response:
{
  "success": true,
  "count": number,
  "pagination": {...},
  "data": Card[]
}
```

#### 랜덤 카드
```http
GET /api/v1/cards/random/:count
Parameters:
  - count: 1-10 (뽑을 카드 수)

Response:
{
  "success": true,
  "count": number,
  "data": Card[]
}
```

---

### 2. 인증 API

#### 회원가입
```http
POST /api/v1/auth/register
Content-Type: application/json

Request Body:
{
  "username": string,      // 3-30자, 필수
  "email": string,         // 이메일 형식, 필수
  "password": string,      // 최소 6자, 필수
  "displayName": string    // 선택
}

Response (201):
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": string,
      "username": string,
      "email": string,
      "displayName": string,
      "role": "user" | "admin",
      "createdAt": string
    }
  }
}
```

#### 로그인
```http
POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "email": string,
  "password": string
}

Response (200):
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {...}
  }
}
```

#### 내 정보 조회
```http
GET /api/v1/auth/me
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": User
}
```

#### 로그아웃
```http
POST /api/v1/auth/logout
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3. 타로 스프레드 API

#### 스프레드 목록
```http
GET /api/v1/spreads

Response:
{
  "success": true,
  "count": number,
  "data": Spread[]
}
```

#### Spread Model
```typescript
interface Spread {
  _id: string;
  name: string;          // "One Card", "Three Card", etc.
  nameKo: string;        // "원 카드", "쓰리 카드", etc.
  description: string;
  descriptionKo: string;
  positions: number;     // 카드 위치 수 (1, 3, 5, 10 등)
  positionMeanings: {
    position: number;
    meaning: string;
    meaningKo: string;
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
}
```

---

### 4. 타로 리딩 API

#### 리딩 생성
```http
POST /api/v1/readings
Headers:
  Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "question": string,           // 질문 (필수)
  "questionCategory": string,   // 'love' | 'career' | 'spiritual' | 'general' | 'health'
  "spreadId": string            // 스프레드 ID (필수)
}

Response (201):
{
  "success": true,
  "data": Reading
}
```

#### Reading Model
```typescript
interface Reading {
  _id: string;
  user: string;              // User ID
  question: string;
  questionCategory: string;
  spread: Spread;
  cards: {
    position: number;
    card: Card;
    isReversed: boolean;
  }[];
  interpretation: string;    // AI 해석 (한국어)
  isPublic: boolean;
  isFavorite: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 내 리딩 목록
```http
GET /api/v1/readings
Headers:
  Authorization: Bearer <token>
Query Parameters:
  - page: number
  - limit: number
  - sort: 'recent' | 'oldest' | 'popular'

Response:
{
  "success": true,
  "count": number,
  "pagination": {...},
  "data": Reading[]
}
```

#### 리딩 상세 조회
```http
GET /api/v1/readings/:id
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": Reading
}
```

#### 리딩 삭제
```http
DELETE /api/v1/readings/:id
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Reading deleted successfully"
}
```

---

### 5. 공개 리딩 & 소셜 기능

#### 공개 리딩 피드
```http
GET /api/v1/readings/public
Query Parameters:
  - page: number
  - limit: number
  - sort: 'recent' | 'popular' | 'trending'
  - category: 'love' | 'career' | 'spiritual' | 'general' | 'health'

Response:
{
  "success": true,
  "count": number,
  "pagination": {...},
  "data": Reading[]
}
```

#### 공유된 리딩 보기 (인증 불필요)
```http
GET /api/v1/readings/shared/:id

Response:
{
  "success": true,
  "data": Reading
}
```

#### 리딩 공개/비공개 전환
```http
PUT /api/v1/readings/:id/visibility
Headers:
  Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "isPublic": boolean
}

Response:
{
  "success": true,
  "data": Reading
}
```

#### 즐겨찾기 토글
```http
PUT /api/v1/readings/:id/favorite
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": Reading
}
```

#### 좋아요
```http
POST /api/v1/readings/:id/like
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "likeCount": number
  }
}
```

#### 좋아요 취소
```http
DELETE /api/v1/readings/:id/like
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "likeCount": number
  }
}
```

---

### 6. 댓글 API

#### 댓글 작성
```http
POST /api/v1/readings/:id/comments
Headers:
  Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "content": string  // 댓글 내용 (필수)
}

Response (201):
{
  "success": true,
  "data": Comment
}
```

#### Comment Model
```typescript
interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
  };
  reading: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 댓글 목록
```http
GET /api/v1/readings/:id/comments
Query Parameters:
  - page: number
  - limit: number

Response:
{
  "success": true,
  "count": number,
  "pagination": {...},
  "data": Comment[]
}
```

#### 댓글 수정
```http
PUT /api/v1/comments/:id
Headers:
  Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "content": string
}

Response:
{
  "success": true,
  "data": Comment
}
```

#### 댓글 삭제
```http
DELETE /api/v1/comments/:id
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### 7. 사용자 대시보드 API

#### 종합 대시보드
```http
GET /api/v1/users/dashboard
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalReadings": number,
    "favoriteReadings": number,
    "publicReadings": number,
    "totalViews": number,
    "totalLikes": number,
    "totalComments": number,
    "topCards": Card[],
    "monthlyTrend": {
      "month": string,
      "count": number
    }[],
    "recentReadings": Reading[]
  }
}
```

#### 카테고리별 통계
```http
GET /api/v1/users/dashboard/categories
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "love": number,
    "career": number,
    "spiritual": number,
    "general": number,
    "health": number
  }
}
```

#### 카드 빈도 분석
```http
GET /api/v1/users/dashboard/cards
Headers:
  Authorization: Bearer <token>
Query Parameters:
  - limit: number (기본값: 20)

Response:
{
  "success": true,
  "data": {
    "card": Card,
    "count": number,
    "percentage": number
  }[]
}
```

---

### 8. 리딩 내보내기 API

#### PDF 내보내기
```http
GET /api/v1/users/export?format=pdf
Headers:
  Authorization: Bearer <token>

Response: Binary (PDF file)
```

#### CSV 내보내기
```http
GET /api/v1/users/export?format=csv
Headers:
  Authorization: Bearer <token>

Response: Text (CSV file)
```

#### JSON 내보내기
```http
GET /api/v1/users/export?format=json
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": Reading[]
}
```

---

## 🧪 테스트 계정

### 일반 사용자
```
Email: test@unwoldam.com
Password: password123
```

### 관리자
```
Email: admin@unwoldam.com
Password: admin123
```

---

## 📊 에러 응답 형식

### 에러 응답
```typescript
interface ErrorResponse {
  success: false;
  error: string;        // 에러 메시지
  statusCode?: number;  // HTTP 상태 코드
}
```

### 일반적인 에러 코드
- `400` - Bad Request (잘못된 요청)
- `401` - Unauthorized (인증 필요)
- `403` - Forbidden (권한 없음)
- `404` - Not Found (리소스 없음)
- `500` - Internal Server Error (서버 오류)
- `501` - Not Implemented (미구현 기능)

---

## 🎨 프론트엔드 권장 기술 스택

### 필수
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **HTTP Client:** axios 또는 fetch

### 권장
- **State Management:** Zustand 또는 React Context
- **Form:** react-hook-form + zod
- **Icons:** lucide-react
- **Animation:** framer-motion
- **Charts:** recharts (대시보드용)
- **Date:** date-fns

---

## 🚀 빠른 시작 예제

### API 클라이언트 설정
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tarot-production-ed3e.up.railway.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 에러 핸들링
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 로그아웃 처리
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 카드 조회 예제
```typescript
// services/cards.ts
import api from '@/lib/api';
import { Card } from '@/types';

export const getCards = async (params?: {
  arcana?: 'Major' | 'Minor';
  suit?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<{
    success: true;
    count: number;
    data: Card[];
  }>('/cards', { params });
  return response.data;
};

export const getCard = async (id: string) => {
  const response = await api.get<{
    success: true;
    data: Card;
  }>(`/cards/${id}`);
  return response.data;
};

export const getRandomCards = async (count: number) => {
  const response = await api.get<{
    success: true;
    count: number;
    data: Card[];
  }>(`/cards/random/${count}`);
  return response.data;
};
```

### 인증 예제
```typescript
// services/auth.ts
import api from '@/lib/api';

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}) => {
  const response = await api.post('/auth/register', data);
  const { token, user } = response.data.data;
  localStorage.setItem('token', token);
  return { token, user };
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data.data;
  localStorage.setItem('token', token);
  return { token, user };
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
```

### 리딩 생성 예제
```typescript
// services/readings.ts
import api from '@/lib/api';

export const createReading = async (data: {
  question: string;
  questionCategory: string;
  spreadId: string;
}) => {
  const response = await api.post('/readings', data);
  return response.data.data;
};

export const getMyReadings = async (params?: {
  page?: number;
  limit?: number;
  sort?: 'recent' | 'oldest' | 'popular';
}) => {
  const response = await api.get('/readings', { params });
  return response.data;
};

export const getPublicReadings = async (params?: {
  page?: number;
  limit?: number;
  sort?: 'recent' | 'popular' | 'trending';
  category?: string;
}) => {
  const response = await api.get('/readings/public', { params });
  return response.data;
};
```

---

## 📝 중요 참고사항

### 1. CORS 설정
- API 서버는 모든 origin에서 접근 가능하도록 설정됨
- 로컬 개발 시 별도 설정 불필요

### 2. Rate Limiting
- 기본: 15분당 100 요청
- 초과 시 429 에러 반환

### 3. MongoDB Atlas 상태
- 현재 JSON 기반으로 작동 중
- MongoDB는 선택적 (사용자 데이터, 리딩 저장용)

### 4. 카드 이미지
- `imageUrl` 필드는 현재 비어있음
- 프론트엔드에서 카드 번호로 이미지 매핑 필요
- 또는 별도 이미지 호스팅 후 URL 추가

### 5. AI 해석 기능
- Claude AI 사용 (Anthropic API)
- 리딩 생성 시 자동으로 한국어 해석 생성
- 응답 시간: 2-5초

---

## 🎯 다음 단계

1. **프론트엔드 프로젝트 생성**
   ```bash
   npx create-next-app@latest tarot-web --typescript --tailwind --app
   ```

2. **API 클라이언트 설정**
   - axios 설치 및 설정
   - 인터셉터로 토큰 자동 추가

3. **주요 페이지 구현**
   - 홈 (카드 소개)
   - 카드 목록
   - 리딩 생성
   - 내 리딩
   - 대시보드

4. **배포**
   - Vercel, Netlify 등에 배포
   - 환경변수로 API URL 설정

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2025-10-28
**배포 상태:** ✅ Production Ready
