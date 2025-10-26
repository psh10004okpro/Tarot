# Railway 배포 가이드

Unwoldam Studio Tarot API를 Railway에 배포하는 단계별 가이드입니다.

## 📋 사전 준비

### 1. 필수 계정
- [x] GitHub 계정
- [x] Railway 계정 (https://railway.app)
- [x] MongoDB Atlas 계정
- [x] Anthropic API 키 (https://console.anthropic.com)
- [x] OpenAI API 키 (https://platform.openai.com)

### 2. 비용 예상
- Railway 무료 티어: $5/월 크레딧 제공
- 예상 사용량: $3-5/월 (무료 범위 내)
- MongoDB Atlas: M0 무료 티어 사용 가능
- AI API 비용: 사용량에 따라 변동

---

## 🚀 배포 방법 1: Railway Dashboard (권장)

### Step 1: Railway 프로젝트 생성

1. https://railway.app 접속
2. "Start a New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택: `psh10004okpro/Tarot`
5. 브랜치 선택: `claude/init-project-structure-011CUUBaPsK8zBWDg55tcqpV` (또는 main)

### Step 2: 환경변수 설정

Railway Dashboard → Variables → 다음 변수 추가:

```env
# Required
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://psh10004okpro_db_user:343UepdCn65DT9oL@tarot.eegvwrn.mongodb.net/unwoldam?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_production_jwt_secret_change_this_to_random_string

# AI APIs
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Claude Configuration
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=2000
CLAUDE_TEMPERATURE=0.7

# OpenAI Voice Configuration
TTS_MODEL=tts-1-hd
TTS_VOICE=nova
TTS_SPEED=0.95

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**중요:**
- `JWT_SECRET`은 반드시 변경하세요! (예: 32자 이상 랜덤 문자열)
- Anthropic, OpenAI API 키를 실제 키로 교체하세요

### Step 3: 배포 시작

1. Variables 저장 후 자동으로 배포 시작
2. Deployments 탭에서 진행 상황 확인
3. 빌드 로그 확인 (2-3분 소요)

### Step 4: 도메인 확인

1. Settings → Domains
2. Railway 기본 도메인 확인 (예: `tarot-api.up.railway.app`)
3. 또는 커스텀 도메인 추가 가능

### Step 5: 데이터베이스 시드

**Railway CLI를 통한 시드:**
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 링크
railway link

# 시드 실행
railway run npm run seed
```

**또는 임시로 로컬에서 시드:**
```bash
# .env 파일에 Railway MongoDB URI 설정
MONGODB_URI=mongodb+srv://psh10004okpro_db_user:343UepdCn65DT9oL@tarot.eegvwrn.mongodb.net/unwoldam?retryWrites=true&w=majority

# 시드 실행
npm run seed
```

---

## 🛠️ 배포 방법 2: Railway CLI

### Step 1: CLI 설치 및 로그인

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 버전 확인
railway --version

# 로그인 (브라우저 열림)
railway login
```

### Step 2: 프로젝트 초기화

```bash
cd /home/user/Tarot

# 새 프로젝트 생성
railway init

# 프로젝트 이름 입력: unwoldam-tarot-api
```

### Step 3: 환경변수 설정 (CLI)

```bash
# 한 번에 설정
railway variables set MONGODB_URI="mongodb+srv://psh10004okpro_db_user:343UepdCn65DT9oL@tarot.eegvwrn.mongodb.net/unwoldam?retryWrites=true&w=majority"

railway variables set JWT_SECRET="$(openssl rand -base64 32)"

railway variables set ANTHROPIC_API_KEY="your_anthropic_key"

railway variables set OPENAI_API_KEY="your_openai_key"

railway variables set NODE_ENV="production"

railway variables set CLAUDE_MODEL="claude-sonnet-4-20250514"

railway variables set TTS_MODEL="tts-1-hd"

railway variables set TTS_VOICE="nova"

# 환경변수 확인
railway variables
```

### Step 4: 배포

```bash
# 배포 시작
railway up

# 또는 현재 브랜치 배포
git push railway main
```

### Step 5: 로그 확인

```bash
# 실시간 로그
railway logs

# 특정 서비스 로그
railway logs --service tarot-api
```

### Step 6: 도메인 확인

```bash
# 도메인 확인
railway domain

# 예시 출력: https://tarot-api-production.up.railway.app
```

---

## ✅ 배포 확인

### 1. 헬스체크

```bash
curl https://your-app.railway.app/health

# 예상 응답:
{
  "success": true,
  "message": "Unwoldam API is running",
  "timestamp": "2025-10-26T...",
  "environment": "production"
}
```

### 2. API 문서 확인

브라우저에서 접속:
```
https://your-app.railway.app/api-docs
```

### 3. 주요 엔드포인트 테스트

```bash
# 회원가입
curl -X POST https://your-app.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "테스트 사용자"
  }'

# 로그인
curl -X POST https://your-app.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 카드 목록
curl https://your-app.railway.app/api/v1/cards
```

---

## 📊 모니터링

### Railway Dashboard

1. **Metrics 탭**
   - CPU 사용량
   - 메모리 사용량
   - 네트워크 트래픽
   - 응답 시간

2. **Logs 탭**
   - 실시간 애플리케이션 로그
   - 에러 로그
   - 접속 로그

3. **Deployments 탭**
   - 배포 히스토리
   - 롤백 기능
   - 빌드 로그

### 비용 모니터링

```bash
# CLI로 사용량 확인
railway status

# 대시보드: Settings → Usage
```

**알림 설정:**
- Settings → Notifications
- 비용 $10 도달 시 이메일 알림 권장

---

## 🔧 문제 해결

### 문제 1: 배포 실패 (빌드 에러)

```bash
# 로그 확인
railway logs

# 일반적 원인:
# 1. package.json의 scripts 확인
# 2. Node.js 버전 확인 (18 이상)
# 3. 환경변수 누락
```

**해결:**
```bash
# package.json 확인
railway run cat package.json

# Node.js 버전 설정 (package.json)
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### 문제 2: MongoDB 연결 실패

```bash
# 로그에서 확인
railway logs | grep -i mongo

# 원인: MONGODB_URI 오타 또는 잘못된 값
```

**해결:**
```bash
# 환경변수 재설정
railway variables set MONGODB_URI="올바른_연결_문자열"

# 재배포
railway up --detach
```

### 문제 3: 503 Service Unavailable

```bash
# 헬스체크 실패 가능성
railway logs | grep -i health

# 원인: 포트 바인딩 오류
```

**해결:**
```javascript
// server.js에서 PORT 환경변수 사용 확인
const PORT = process.env.PORT || 3000;
```

### 문제 4: AI API 호출 실패

```bash
# 로그 확인
railway logs | grep -i "anthropic\|openai"

# API 키 확인
railway variables | grep API_KEY
```

**해결:**
```bash
# API 키 재설정
railway variables set ANTHROPIC_API_KEY="new_key"
railway variables set OPENAI_API_KEY="new_key"
```

---

## 🔄 업데이트 배포

### Git Push 자동 배포

```bash
# 코드 수정 후
git add .
git commit -m "feat: new feature"
git push origin main

# Railway가 자동으로 재배포 (2-3분)
```

### 수동 재배포

```bash
railway up --detach
```

### 롤백

```bash
# Railway Dashboard → Deployments
# 이전 버전 클릭 → "Redeploy" 버튼
```

---

## 💰 비용 최적화

### 1. 메모리 최적화

```javascript
// server.js 상단에 추가
process.env.NODE_OPTIONS = '--max-old-space-size=256';
```

### 2. 연결 풀 최적화

```javascript
// src/config/database.js
mongoose.connect(uri, {
  maxPoolSize: 10, // 기본 50 → 10
  minPoolSize: 2,
});
```

### 3. 로그 레벨 조정

```javascript
// production에서는 INFO 이상만
if (process.env.NODE_ENV === 'production') {
  logger.level = 'info';
}
```

### 4. 정적 파일 캐싱

```javascript
// server.js
app.use('/audio', express.static('public/audio', {
  maxAge: '1d', // 1일 캐싱
}));
```

---

## 🎯 다음 단계

### 1. 커스텀 도메인 연결

```bash
# Railway Dashboard → Settings → Domains
# Custom Domain 추가
# DNS 설정: CNAME → your-app.up.railway.app
```

### 2. CI/CD 파이프라인

```yaml
# .github/workflows/railway-deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @railway/cli
      - run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 3. 모니터링 연동

- Datadog
- Sentry
- LogDNA

### 4. 백업 자동화

```bash
# MongoDB Atlas에서 자동 백업 설정
# Railway 환경변수 백업 (정기적)
```

---

## 📞 지원

### Railway 공식 자료
- 문서: https://docs.railway.app
- Discord: https://discord.gg/railway
- 상태 페이지: https://status.railway.app

### 프로젝트 이슈
- GitHub Issues: https://github.com/psh10004okpro/Tarot/issues

---

## 🎉 완료!

축하합니다! Unwoldam Tarot API가 Railway에 성공적으로 배포되었습니다.

**접속 URL:**
```
https://your-app.railway.app
```

**API 문서:**
```
https://your-app.railway.app/api-docs
```

**다음 단계:**
- [ ] 프론트엔드 개발
- [ ] 사용자 테스트
- [ ] 성능 모니터링
- [ ] 마케팅 시작

행운을 빕니다! 🚀✨
