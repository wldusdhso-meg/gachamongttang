# 프로덕션 배포 가이드

## 📋 사전 요구사항

1. **Java 17 이상** 설치 및 설정
   ```bash
   java -version  # Java 17 이상 확인
   ```

2. **Node.js 18 이상** 설치
   ```bash
   node -v  # Node.js 18 이상 확인
   ```

## 🚀 빠른 시작

### 1. 전체 빌드 및 실행

```bash
# 전체 빌드 (프론트엔드 + 백엔드)
./deploy.sh build

# 애플리케이션 시작
./deploy.sh start

# 상태 확인
./deploy.sh status
```

### 2. 개별 빌드

```bash
# 프론트엔드만 빌드
./deploy.sh build-frontend

# 백엔드만 빌드
./deploy.sh build-backend
```

## 📝 배포 스크립트 명령어

| 명령어 | 설명 |
|--------|------|
| `./deploy.sh build` | 프론트엔드와 백엔드 모두 빌드 |
| `./deploy.sh build-frontend` | 프론트엔드만 빌드 |
| `./deploy.sh build-backend` | 백엔드만 빌드 |
| `./deploy.sh start` | 애플리케이션 시작 |
| `./deploy.sh stop` | 애플리케이션 중지 |
| `./deploy.sh restart` | 애플리케이션 재시작 |
| `./deploy.sh status` | 애플리케이션 상태 확인 |

## 🔧 macOS 서비스로 등록 (launchd)

시스템 재부팅 후에도 자동으로 실행되도록 설정:

### 1. 서비스 등록

```bash
# plist 파일을 LaunchAgents 디렉토리로 복사
cp com.meg.gachamongddang.plist ~/Library/LaunchAgents/

# 서비스 로드
launchctl load ~/Library/LaunchAgents/com.meg.gachamongddang.plist

# 서비스 시작
launchctl start com.meg.gachamongddang
```

### 2. 서비스 관리

```bash
# 서비스 중지
launchctl stop com.meg.gachamongddang

# 서비스 시작
launchctl start com.meg.gachamongddang

# 서비스 상태 확인
launchctl list | grep gachamongddang

# 서비스 제거
launchctl unload ~/Library/LaunchAgents/com.meg.gachamongddang.plist
rm ~/Library/LaunchAgents/com.meg.gachamongddang.plist
```

### 3. plist 파일 수정

서비스 등록 전에 `com.meg.gachamongddang.plist` 파일의 경로를 실제 환경에 맞게 수정하세요:

- `JAVA_HOME`: 실제 Java 설치 경로
- JAR 파일 경로: 빌드된 JAR 파일의 실제 경로

## 📂 디렉토리 구조

```
gachamongddang/
├── deploy.sh                    # 배포 스크립트
├── com.meg.gachamongddang.plist # macOS 서비스 설정
├── build/libs/                  # 빌드된 JAR 파일
├── logs/                        # 로그 파일
│   ├── app.log                  # 애플리케이션 로그
│   ├── application.log          # Spring Boot 로그
│   └── service.log              # 서비스 로그
└── src/main/resources/static/   # 프론트엔드 빌드 결과
```

## 🌐 접속 정보

- **애플리케이션**: http://localhost:8080
- **API 엔드포인트**: http://localhost:8080/v1

## 📋 로그 확인

```bash
# 애플리케이션 로그 실시간 확인
tail -f logs/app.log

# Spring Boot 로그 확인
tail -f logs/application.log

# 서비스 로그 확인
tail -f logs/service.log
```

## 🔍 문제 해결

### Java 버전 오류

```
Error: Dependency requires at least JVM runtime version 17
```

**해결 방법:**
1. Java 17 이상 설치
2. `JAVA_HOME` 환경 변수 설정
3. `java -version`으로 버전 확인

### 포트 충돌

```
Error: Port 8080 is already in use
```

**해결 방법:**
1. `application.properties`에서 포트 변경
2. 또는 사용 중인 프로세스 종료:
   ```bash
   lsof -ti:8080 | xargs kill
   ```

### JAR 파일 없음

```
Error: JAR 파일을 찾을 수 없습니다
```

**해결 방법:**
```bash
./deploy.sh build
```

## 🔄 업데이트 프로세스

1. 코드 변경 후 빌드:
   ```bash
   ./deploy.sh build
   ```

2. 재시작:
   ```bash
   ./deploy.sh restart
   ```

또는 서비스로 등록된 경우:
```bash
launchctl stop com.meg.gachamongddang
launchctl start com.meg.gachamongddang
```

## 🐳 Docker 배포 (선택사항)

Docker를 사용하는 경우:

```bash
# Dockerfile이 이미 있음 (mongddang-front/web/Dockerfile)
# 백엔드용 Dockerfile 생성 필요
```

## 📞 지원

문제가 발생하면 로그 파일을 확인하세요:
- `logs/app.log`
- `logs/application.log`
- `logs/service.log`

