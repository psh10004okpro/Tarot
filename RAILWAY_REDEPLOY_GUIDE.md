# Railway 배포 브랜치 변경 가이드

## 현재 상황
- 배포된 브랜치: `claude/init-project-structure-011CUUBaPsK8zBWDg55tcqpV`
- 최신 작업 브랜치: `claude/session-011CUZkmZLFAM7eBx3jy42yc`

## Railway Dashboard에서 브랜치 변경

### 1단계: Railway Dashboard 접속
```
https://railway.app/dashboard
```

### 2단계: Tarot 프로젝트 선택

### 3단계: Settings 탭 클릭

### 4단계: Source → Branch 섹션 찾기

### 5단계: 브랜치 변경
```
변경 전: claude/init-project-structure-011CUUBaPsK8zBWDg55tcqpV
변경 후: claude/session-011CUZkmZLFAM7eBx3jy42yc
```

### 6단계: Save 클릭
- 자동으로 재배포 시작됨
- 5-10분 후 새 버전 배포 완료

---

## 배포 후 확인사항

### ✅ API가 정상 작동하는지 확인:
```bash
# 카드 조회 (78장)
curl https://tarot-production-ed3e.up.railway.app/api/v1/cards

# 메이저 아르카나 (22장)
curl https://tarot-production-ed3e.up.railway.app/api/v1/cards?arcana=Major

# 마이너 아르카나 (56장)
curl https://tarot-production-ed3e.up.railway.app/api/v1/cards?arcana=Minor
```

### ✅ MongoDB Atlas 환경변수 확인:
Railway Variables에 최신 MongoDB URI가 설정되어 있는지 확인:
```
MONGODB_URI=mongodb+srv://unwoldamstudio_db_user:XcCwPCbbEicfarI3@cluster0.ofyr0zi.mongodb.net/unwoldam?retryWrites=true&w=majority&appName=Cluster0
```

---

## 재배포 완료 후

서버 로그에서 다음 메시지 확인:
```
✅ Loaded 78 tarot cards from JSON
```

이 메시지가 보이면 성공!
