# 🎴 Unwoldam Tarot 웹 애플리케이션 개발 - Claude Code 프롬프트

## 📌 프로젝트 개요

AI 기반 타로 카드 리딩 서비스 **Unwoldam Tarot**의 프론트엔드 웹 애플리케이션을 개발합니다.

**백엔드 API는 이미 완성되어 Railway에 배포된 상태**이며, 프론트엔드만 개발하면 됩니다.

---

## 🚀 백엔드 API 정보

```
Production URL: https://tarot-production-ed3e.up.railway.app
API Base: /api/v1
배포 상태: ✅ 정상 작동 중
데이터: 78장 타로 카드 (메이저 22장 + 마이너 56장)
```

### 주요 API 엔드포인트

```javascript
// 타로 카드
GET  /api/v1/cards                    // 모든 카드 (78장)
GET  /api/v1/cards?arcana=Major       // 메이저 아르카나 (22장)
GET  /api/v1/cards/:id                // 특정 카드 (예: AR00)
GET  /api/v1/cards/random/3           // 랜덤 카드 3장

// 인증
POST /api/v1/auth/register            // 회원가입
POST /api/v1/auth/login               // 로그인
GET  /api/v1/auth/me                  // 내 정보

// 타로 리딩
POST /api/v1/readings                 // 리딩 생성 (AI 해석)
GET  /api/v1/readings                 // 내 리딩 목록
GET  /api/v1/readings/public          // 공개 리딩 피드

// 소셜
POST /api/v1/readings/:id/like        // 좋아요
POST /api/v1/readings/:id/comments    // 댓글 작성

// 대시보드
GET  /api/v1/users/dashboard          // 통계 및 분석
```

---

## 🎯 개발 목표

### Phase 1: 핵심 기능 (MVP)
1. ✅ **홈페이지** - 서비스 소개, 카드 소개
2. ✅ **카드 목록** - 78장 타로 카드 조회/검색
3. ✅ **리딩 생성** - 질문 입력 → AI 해석 받기
4. ✅ **인증** - 회원가입/로그인

### Phase 2: 고급 기능
5. ✅ **내 리딩** - 과거 리딩 기록 조회
6. ✅ **공개 피드** - 다른 사용자 리딩 보기
7. ✅ **소셜** - 좋아요, 댓글
8. ✅ **대시보드** - 통계 및 분석

---

## 💻 권장 기술 스택

```bash
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
Components: shadcn/ui
HTTP: axios
State: Zustand 또는 Context API
Form: react-hook-form + zod
Icons: lucide-react
Animation: framer-motion
```

---

## 📦 타로 카드 데이터 구조

```typescript
interface Card {
  // 식별
  nameShort: string;        // "AR00", "CU01"
  name: string;             // "THE FOOL"
  nameKo: string;           // "바보(광대)"
  arcana: 'Major' | 'Minor';
  number: number;

  // 해석 (모두 한국어)
  keywords: string[];       // 키워드 배열
  love: string;            // 연애운
  finance: string;         // 금전운
  health: string;          // 건강운
  educationCareerBusiness: string;  // 학업/직업
  advice: string;          // 조언
  caution: string;         // 주의사항

  // 상세
  imageDescription: string; // 카드 이미지 설명
  numerology: string;       // 숫자학
  symbolism: string;        // 상징
}
```

---

## 🔐 인증 흐름

```typescript
// 1. 로그인
POST /api/v1/auth/login
Body: { email, password }
Response: { token, user }

// 2. 토큰 저장
localStorage.setItem('token', token);

// 3. 이후 요청에 토큰 포함
Headers: { Authorization: "Bearer <token>" }
```

---

## 🎴 리딩 생성 플로우

```typescript
// 1. 스프레드 선택
GET /api/v1/spreads
→ 원카드, 쓰리카드, 켈틱크로스 등

// 2. 질문 입력 + 리딩 생성
POST /api/v1/readings
Body: {
  question: "나의 연애운은?",
  questionCategory: "love",
  spreadId: "spread_id"
}

// 3. AI 해석 받기 (자동)
Response: {
  cards: [...],           // 뽑힌 카드들
  interpretation: "..."   // Claude AI의 한국어 해석
}
```

---

## 🧪 테스트 계정

```
일반 사용자:
Email: test@unwoldam.com
Password: password123

관리자:
Email: admin@unwoldam.com
Password: admin123
```

---

## 📝 API 사용 예제

### API 클라이언트 설정
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tarot-production-ed3e.up.railway.app/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 카드 조회
```typescript
// services/cards.ts
import api from '@/lib/api';

export const getCards = async () => {
  const { data } = await api.get('/cards');
  return data.data; // 78장의 Card[]
};

export const getCard = async (id: string) => {
  const { data } = await api.get(`/cards/${id}`);
  return data.data; // Card
};
```

### 로그인
```typescript
// services/auth.ts
import api from '@/lib/api';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.data.token);
  return data.data.user;
};
```

---

## 🎨 UI/UX 참고사항

### 디자인 방향
- 🌙 **다크/신비로운 분위기** (타로 느낌)
- ✨ **애니메이션** (카드 뒤집기, 등장 효과)
- 📱 **반응형** (모바일 우선)
- 🎴 **카드 중심** (카드 이미지가 주인공)

### 주요 페이지 구성
```
/                    → 홈 (서비스 소개)
/cards               → 카드 목록 (78장)
/cards/[id]          → 카드 상세
/reading             → 리딩 생성
/reading/[id]        → 리딩 결과
/readings            → 내 리딩 목록
/feed                → 공개 리딩 피드
/dashboard           → 대시보드
/login               → 로그인
/register            → 회원가입
```

---

## 🚀 빠른 시작

### 1. 프로젝트 생성
```bash
npx create-next-app@latest tarot-web --typescript --tailwind --app
cd tarot-web
```

### 2. 패키지 설치
```bash
npm install axios zustand react-hook-form zod
npm install lucide-react framer-motion
npm install @radix-ui/react-dialog @radix-ui/react-toast
```

### 3. shadcn/ui 설정
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog input toast
```

### 4. 환경변수 (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://tarot-production-ed3e.up.railway.app/api/v1
```

### 5. API 테스트
```typescript
// app/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch('https://tarot-production-ed3e.up.railway.app/api/v1/cards?limit=5')
      .then(res => res.json())
      .then(data => setCards(data.data));
  }, []);

  return (
    <div>
      <h1>Unwoldam Tarot</h1>
      <div>
        {cards.map((card: any) => (
          <div key={card.nameShort}>
            {card.name} - {card.nameKo}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 상세 문서

프로젝트 저장소의 다음 문서들을 참고하세요:

1. **FRONTEND_API_REFERENCE.md** - 전체 API 명세 (필수!)
2. **FRONTEND_PROMPT.md** - 상세 개발 가이드
3. **FRONTEND_KICKOFF.md** - API 엔드포인트 요약

GitHub 저장소: https://github.com/psh10004okpro/Tarot

---

## 💡 개발 팁

### 1. 카드 이미지 처리
```typescript
// 현재 imageUrl이 없으므로 로컬 이미지 사용
const getCardImage = (nameShort: string) => {
  return `/images/cards/${nameShort.toLowerCase()}.jpg`;
};
```

### 2. 토큰 관리
```typescript
// useAuth.ts (Zustand)
import create from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
```

### 3. 에러 처리
```typescript
// lib/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## ✅ 체크리스트

### 시작 전
- [ ] API 테스트 (브라우저에서 직접 URL 확인)
- [ ] 테스트 계정으로 로그인 테스트
- [ ] FRONTEND_API_REFERENCE.md 문서 읽기

### 개발 중
- [ ] TypeScript 타입 정의
- [ ] 에러 처리 및 로딩 상태
- [ ] 반응형 디자인
- [ ] 접근성 (a11y)

### 배포 전
- [ ] 환경변수 설정
- [ ] 빌드 테스트
- [ ] SEO 최적화
- [ ] 성능 최적화

---

## 🎯 Claude Code 세션에서 사용할 프롬프트

```
Unwoldam Tarot 웹 애플리케이션을 Next.js + TypeScript + Tailwind CSS로 개발해주세요.

백엔드 API: https://tarot-production-ed3e.up.railway.app/api/v1
API 문서: GitHub의 FRONTEND_API_REFERENCE.md 참고

주요 기능:
1. 타로 카드 목록 (78장) - /cards
2. 카드 상세 정보 - /cards/[id]
3. 리딩 생성 (AI 해석) - /reading
4. 회원가입/로그인 - /login, /register
5. 내 리딩 목록 - /readings

기술 스택:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- axios

먼저 프로젝트 구조를 제안하고, API 클라이언트 설정부터 시작해주세요.
테스트 계정: test@unwoldam.com / password123
```

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2025-10-28
**백엔드 상태:** ✅ Production Ready
