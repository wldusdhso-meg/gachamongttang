# Docker 배포 가이드

## 📦 Docker 이미지 빌드 및 실행

### 전체 서비스 실행 (프로덕션)

프론트엔드와 서버를 모두 도커로 실행:

```bash
# 이미지 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 개별 서비스 실행

#### 서버만 실행
```bash
# 서버 이미지 빌드
docker build -f Dockerfile.server -t gachamongddang-server .

# 서버 실행
docker run -d -p 8080:8080 --name server gachamongddang-server
```

#### 프론트엔드만 실행
```bash
# 프론트엔드 이미지 빌드
docker build -f Dockerfile.frontend -t gachamongddang-frontend .

# 프론트엔드 실행
docker run -d -p 80:80 --name frontend gachamongddang-frontend
```

### 개발 환경

프론트엔드는 개발 서버로, 서버만 도커로 실행:

```bash
# 서버만 도커로 실행
docker-compose -f docker-compose.dev.yml up -d

# 프론트엔드 개발 서버 실행 (별도 터미널)
cd mongddang-front/web
npm run dev
```

## 🔧 Docker 이미지 구조

### 서버 이미지 (Dockerfile.server)
- **베이스 이미지**: `eclipse-temurin:21-jre-alpine`
- **빌드 과정**:
  1. 프론트엔드 빌드 (Node.js)
  2. 서버 빌드 (Gradle)
  3. 프론트엔드 빌드 결과를 서버 static 폴더에 복사
  4. JAR 파일 생성
- **포트**: 8080
- **실행**: Spring Boot JAR 파일

### 프론트엔드 이미지 (Dockerfile.frontend)
- **베이스 이미지**: `nginx:alpine`
- **빌드 과정**:
  1. Node.js로 프론트엔드 빌드
  2. Nginx로 정적 파일 서빙
- **포트**: 80
- **기능**: API 프록시 설정 포함 (`/v1/*` → 서버)

## 📋 Docker Compose 서비스

### server
- API 서버 (Spring Boot)
- 포트: 8080
- 헬스체크: `/actuator/health` (구현 필요)

### frontend
- 프론트엔드 (Nginx)
- 포트: 80
- API 프록시: `/v1/*` → `server:8080`

## 🚀 배포 워크플로우

### 1. 프로덕션 배포

```bash
# 이미지 빌드
docker-compose build

# 서비스 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f server
docker-compose logs -f frontend
```

### 2. 이미지 업데이트

```bash
# 이미지 재빌드
docker-compose build --no-cache

# 서비스 재시작
docker-compose up -d --force-recreate
```

### 3. 이미지 태그 및 푸시

```bash
# 이미지 태그
docker tag gachamongddang-server:latest your-registry/gachamongddang-server:latest
docker tag gachamongddang-frontend:latest your-registry/gachamongddang-frontend:latest

# 이미지 푸시
docker push your-registry/gachamongddang-server:latest
docker push your-registry/gachamongddang-frontend:latest
```

## 🔍 문제 해결

### 포트 충돌
```bash
# 포트 변경 (docker-compose.yml 수정)
ports:
  - "8081:8080"  # 호스트:컨테이너
```

### 빌드 실패
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 로그 확인
docker-compose build 2>&1 | tee build.log
```

### 컨테이너 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs server
docker-compose logs frontend

# 실시간 로그
docker-compose logs -f
```

## 📝 환경 변수

### 서버 환경 변수
- `SPRING_PROFILES_ACTIVE`: Spring 프로파일 (prod, dev)
- `SERVER_PORT`: 서버 포트 (기본: 8080)

### docker-compose.yml에서 설정
```yaml
environment:
  - SPRING_PROFILES_ACTIVE=prod
  - SERVER_PORT=8080
```

## 🔐 보안 고려사항

1. **환경 변수**: 민감한 정보는 `.env` 파일 사용
2. **네트워크**: 내부 네트워크로 서비스 간 통신
3. **볼륨**: 로그 파일만 볼륨 마운트

## 📦 이미지 최적화

- 멀티 스테이지 빌드 사용
- Alpine Linux 베이스 이미지 사용
- 불필요한 파일 제외 (`.dockerignore`)


