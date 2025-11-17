#!/bin/bash

# 프로덕션 배포 스크립트
# 사용법: ./deploy.sh [build|start|stop|restart|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
SERVER_DIR="$ROOT_DIR/server"
FRONTEND_DIR="$ROOT_DIR/gachamongddang-front/web"
STATIC_DIR="$SERVER_DIR/src/main/resources/static"
BUILD_DIR="$SERVER_DIR/build/libs"
APP_NAME="server"
JAR_FILE="$BUILD_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar"
PID_FILE="$ROOT_DIR/${APP_NAME}.pid"
LOG_FILE="$ROOT_DIR/logs/app.log"

# 로그 디렉토리 생성
mkdir -p "$ROOT_DIR/logs"
mkdir -p "$STATIC_DIR"

build_frontend() {
    echo "=== 프론트엔드 빌드 중 ==="
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo "의존성 설치 중..."
        npm install
    fi
    
    echo "프론트엔드 빌드 중..."
    npm run build
    
    echo "빌드된 파일을 Spring Boot static 폴더로 복사 중..."
    rm -rf "$STATIC_DIR"/*
    cp -r dist/* "$STATIC_DIR/"
    
    echo "✅ 프론트엔드 빌드 완료"
}

build_backend() {
    echo "=== 백엔드 빌드 중 ==="
    cd "$ROOT_DIR"
    
    echo "JAR 파일 빌드 중..."
    ./gradlew :server:clean :server:bootJar
    
    if [ ! -f "$JAR_FILE" ]; then
        echo "❌ JAR 파일 빌드 실패"
        exit 1
    fi
    
    echo "✅ 백엔드 빌드 완료: $JAR_FILE"
}

build_all() {
    echo "=== 전체 빌드 시작 ==="
    build_frontend
    build_backend
    echo "✅ 전체 빌드 완료"
}

start_app() {
    if [ -f "$PID_FILE" ] && ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "⚠️  애플리케이션이 이미 실행 중입니다. (PID: $(cat $PID_FILE))"
        return
    fi
    
    if [ ! -f "$JAR_FILE" ]; then
        echo "❌ JAR 파일을 찾을 수 없습니다. 먼저 빌드하세요: ./deploy.sh build"
        exit 1
    fi
    
    echo "=== 애플리케이션 시작 중 ==="
    cd "$ROOT_DIR"
    
    # Java 버전 확인
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo "❌ Java 17 이상이 필요합니다. 현재 버전: $JAVA_VERSION"
        echo "JAVA_HOME을 Java 17 이상으로 설정하세요."
        exit 1
    fi
    
    nohup java -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    echo "✅ 애플리케이션이 시작되었습니다. (PID: $(cat $PID_FILE))"
    echo "📋 로그 확인: tail -f $LOG_FILE"
    echo "🌐 애플리케이션: http://localhost:8080"
    
    # 시작 확인
    sleep 3
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "✅ 애플리케이션이 정상적으로 실행 중입니다."
    else
        echo "❌ 애플리케이션 시작 실패. 로그를 확인하세요: $LOG_FILE"
        exit 1
    fi
}

stop_app() {
    if [ ! -f "$PID_FILE" ]; then
        echo "⚠️  애플리케이션이 실행 중이 아닙니다."
        return
    fi
    
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "=== 애플리케이션 종료 중 ==="
        kill $PID
        rm "$PID_FILE"
        
        # 프로세스가 완전히 종료될 때까지 대기
        for i in {1..10}; do
            if ! ps -p $PID > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done
        
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️  강제 종료 중..."
            kill -9 $PID
        fi
        
        echo "✅ 애플리케이션이 종료되었습니다."
    else
        echo "⚠️  프로세스를 찾을 수 없습니다."
        rm "$PID_FILE"
    fi
}

restart_app() {
    echo "=== 애플리케이션 재시작 중 ==="
    stop_app
    sleep 2
    start_app
}

status_app() {
    echo "=== 애플리케이션 상태 ==="
    
    if [ -f "$PID_FILE" ] && ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        PID=$(cat "$PID_FILE")
        echo "✅ 실행 중 (PID: $PID)"
        echo "📋 로그: $LOG_FILE"
        echo "🌐 URL: http://localhost:8080"
        
        # 메모리 사용량 확인
        if command -v ps > /dev/null; then
            MEM=$(ps -o rss= -p $PID 2>/dev/null | awk '{printf "%.1f MB", $1/1024}')
            echo "💾 메모리: $MEM"
        fi
    else
        echo "❌ 중지됨"
        if [ -f "$PID_FILE" ]; then
            rm "$PID_FILE"
        fi
    fi
    
    if [ -f "$JAR_FILE" ]; then
        JAR_SIZE=$(du -h "$JAR_FILE" | cut -f1)
        JAR_DATE=$(stat -f "%Sm" "$JAR_FILE" 2>/dev/null || stat -c "%y" "$JAR_FILE" 2>/dev/null | cut -d' ' -f1)
        echo "📦 JAR 파일: $JAR_FILE ($JAR_SIZE, 빌드일: $JAR_DATE)"
    else
        echo "⚠️  JAR 파일 없음 (빌드 필요)"
    fi
}

case "$1" in
    build)
        build_all
        ;;
    build-frontend)
        build_frontend
        ;;
    build-backend)
        build_backend
        ;;
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    status)
        status_app
        ;;
    *)
        echo "사용법: $0 {build|build-frontend|build-backend|start|stop|restart|status}"
        echo ""
        echo "명령어:"
        echo "  build          - 프론트엔드와 백엔드 모두 빌드"
        echo "  build-frontend - 프론트엔드만 빌드"
        echo "  build-backend  - 백엔드만 빌드"
        echo "  start          - 애플리케이션 시작"
        echo "  stop           - 애플리케이션 중지"
        echo "  restart        - 애플리케이션 재시작"
        echo "  status         - 애플리케이션 상태 확인"
        exit 1
        ;;
esac
