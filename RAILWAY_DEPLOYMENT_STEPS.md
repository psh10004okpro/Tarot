# 🚂 Railway 재배포 실행 가이드

## 📋 배포 전 체크리스트

### ✅ 준비 완료된 사항:
- [x] 78장 타로 카드 데이터 (tarot_cards_en_keys.json)
- [x] 업데이트된 Card 모델
- [x] JSON 기반 cardDataService
- [x] 업데이트된 cardController
- [x] 모든 변경사항 커밋 및 푸시 완료
- [x] 브랜치: `claude/session-011CUZkmZLFAM7eBx3jy42yc`

---

## 🎯 Railway Dashboard 재배포 단계

### 1단계: Railway 로그인
```
https://railway.app/login
```

### 2단계: 프로젝트 선택
- Dashboard에서 **Tarot** 프로젝트 클릭

### 3단계: 배포 브랜치 변경
1. **Settings** 탭 클릭
2. **Source** 섹션 찾기
3. **Branch** 필드 클릭
4. 브랜치 변경:
   ```
   현재: claude/init-project-structure-011CUUBaPsK8zBWDg55tcqpV
   변경: claude/session-011CUZkmZLFAM7eBx3jy42yc
   ```
5. **Save** 클릭

### 4단계: 환경변수 업데이트
1. **Variables** 탭 클릭
2. `MONGODB_URI` 찾기
3. 값 업데이트:
   ```
   mongodb+srv://unwoldamstudio_db_user:XcCwPCbbEicfarI3@cluster0.ofyr0zi.mongodb.net/unwoldam?retryWrites=true&w=majority&appName=Cluster0
   ```
4. **Save** 클릭 (자동으로 재배포 트리거됨)

### 5단계: 배포 모니터링
1. **Deployments** 탭 클릭
2. 최신 배포 상태 확인
3. 로그에서 다음 메시지 확인:
   ```
   ✅ Loaded 78 tarot cards from JSON
   MongoDB connected successfully (또는 연결 실패 시 JSON 모드로 계속)
   Server is running on port 3000
   ```
4. 배포 완료까지 **5-10분** 대기

---

## ✅ 배포 완료 후 검증

### 1. 기본 API 테스트
브라우저나 터미널에서 테스트:

```bash
# 전체 카드 조회 (78장)
curl https://tarot-production-ed3e.up.railway.app/api/v1/cards

# 또는 브라우저에서:
https://tarot-production-ed3e.up.railway.app/api/v1/cards
```

**예상 응답:**
```json
{
  "success": true,
  "count": 78,
  "pagination": {
    "page": 1,
    "limit": 78,
    "total": 78,
    "pages": 1
  },
  "data": [...]
}
```

### 2. 메이저 아르카나 테스트 (22장)
```bash
https://tarot-production-ed3e.up.railway.app/api/v1/cards?arcana=Major
```

### 3. 마이너 아르카나 테스트 (56장)
```bash
https://tarot-production-ed3e.up.railway.app/api/v1/cards?arcana=Minor
```

### 4. 특정 카드 조회
```bash
# The Fool 카드
https://tarot-production-ed3e.up.railway.app/api/v1/cards/AR00
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "card": "0. THE FOOL / 바보(광대) / 메이저 아르카나",
    "nameShort": "AR00",
    "name": "THE FOOL",
    "nameKo": "바보(광대)",
    "arcana": "Major",
    "keywords": ["자유로운", "무계획적인", ...],
    "love": "자유로운 연애를 추구하는 성향...",
    "finance": "돈욕심이 없는...",
    "health": "...",
    ...
  }
}
```

### 5. 랜덤 카드 테스트
```bash
https://tarot-production-ed3e.up.railway.app/api/v1/cards/random/3
```

### 6. API 문서 확인
```bash
https://tarot-production-ed3e.up.railway.app/api-docs
```

---

## 🐛 문제 해결

### 문제 1: 배포 실패
**원인:** 빌드 오류 또는 환경변수 누락
**해결:**
1. Railway Logs 탭에서 에러 메시지 확인
2. 환경변수가 모두 설정되었는지 확인
3. 브랜치 이름이 정확한지 확인

### 문제 2: API 응답이 22장만 반환
**원인:** 이전 브랜치가 배포됨
**해결:**
1. Settings → Source → Branch 확인
2. `claude/session-011CUZkmZLFAM7eBx3jy42yc`로 설정되었는지 확인
3. 수동으로 **Redeploy** 버튼 클릭

### 문제 3: MongoDB 연결 오류
**원인:** MongoDB Atlas IP 화이트리스트 또는 잘못된 URI
**해결:**
- Railway는 JSON 기반으로 작동하므로 MongoDB 없이도 동작함
- 서버 로그에 `✅ Loaded 78 tarot cards from JSON` 표시되면 정상

### 문제 4: 403 Forbidden
**원인:** Railway 배포가 완료되지 않았거나 설정 문제
**해결:**
1. Deployments 탭에서 배포 상태 확인 (Success 확인)
2. 5-10분 대기 후 재시도
3. Settings → Networking에서 Public Domain 확인

---

## 📊 배포 성공 확인사항

- [ ] Railway 배포 상태: **Success** ✅
- [ ] API 응답: **78장 카드** 반환 ✅
- [ ] 메이저 아르카나: **22장** ✅
- [ ] 마이너 아르카나: **56장** ✅
- [ ] 카드 데이터에 한국어 해석 포함 ✅
- [ ] 랜덤 카드 API 작동 ✅
- [ ] API 문서 접근 가능 ✅

---

## 🎉 배포 완료 후

이제 다음을 진행할 수 있습니다:

### 1. 프론트엔드 개발 시작
```typescript
// API Base URL
const API_BASE_URL = 'https://tarot-production-ed3e.up.railway.app/api/v1';

// 카드 조회 예시
fetch(`${API_BASE_URL}/cards`)
  .then(res => res.json())
  .then(data => console.log('78장 카드:', data.data));
```

### 2. 모바일 앱 개발
- React Native, Flutter 등에서 위 API 사용

### 3. 테스트 및 데모
- API가 정상 작동하는지 테스트
- 샘플 데이터로 UI 구성

---

**문서 작성일:** 2025-10-28
**브랜치:** claude/session-011CUZkmZLFAM7eBx3jy42yc
**배포 URL:** https://tarot-production-ed3e.up.railway.app
