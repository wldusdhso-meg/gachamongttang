#!/bin/bash

# 프로덕션 배포 스크립트
# 사용법: ./deploy.sh [build|start|stop|restart|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
SERVER_DIR="$ROOT_DIR/mongddang-api"
FRONTEND_SERVER_DIR="$ROOT_DIR/mongddang-front"
BUILD_DIR="$SERVER_DIR/build/libs"
FRONTEND_BUILD_DIR="$FRONTEND_SERVER_DIR/build/libs"
APP_NAME="mongddang-api"
FRONTEND_APP_NAME="mongddang-front"
JAR_FILE="$BUILD_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar"
FRONTEND_JAR_FILE="$FRONTEND_BUILD_DIR/${FRONTEND_APP_NAME}-0.0.1-SNAPSHOT.jar"
PID_FILE="$ROOT_DIR/${APP_NAME}.pid"
FRONTEND_PID_FILE="$ROOT_DIR/${FRONTEND_APP_NAME}.pid"
LOG_FILE="$ROOT_DIR/logs/app.log"
FRONTEND_LOG_FILE="$ROOT_DIR/logs/frontend.log"

# 로그 디렉토리 생성
mkdir -p "$ROOT_DIR/logs"

build_frontend_server() {
    echo "=== 프론트엔드 서버 빌드 중 ==="
    echo "ℹ️  npm install과 프론트엔드 빌드는 Gradle 태스크가 자동으로 처리합니다."
    cd "$ROOT_DIR"
    
    # Java 버전 확인 및 설정 (Java 21 권장)
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo "⚠️  Java 17 이상이 필요합니다 (권장: Java 21). 현재 버전: $JAVA_VERSION"
        echo "Java 21로 전환 중..."
        
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
        elif [ -d "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home" ]; then
            export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 17로 전환: $JAVA_HOME"
        else
            echo "❌ Java 17 이상을 찾을 수 없습니다."
            exit 1
        fi
    elif [ "$JAVA_VERSION" -lt 21 ]; then
        echo "ℹ️  현재 Java 버전: $JAVA_VERSION (권장: Java 21)"
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
        fi
    else
        echo "✅ Java 21 사용 중 (버전: $JAVA_VERSION)"
    fi
    
    echo "프론트엔드 서버 JAR 파일 빌드 중..."
    echo "  - npmInstall 태스크가 자동으로 npm ci를 실행합니다"
    echo "  - buildFrontend 태스크가 자동으로 npm run build를 실행합니다"
    echo "  - 빌드된 파일이 src/main/resources/static/로 자동 복사됩니다"
    ./gradlew :mongddang-front:clean :mongddang-front:bootJar
    
    if [ ! -f "$FRONTEND_JAR_FILE" ]; then
        echo "❌ 프론트엔드 서버 JAR 파일 빌드 실패"
        exit 1
    fi
    
    echo "✅ 프론트엔드 서버 빌드 완료: $FRONTEND_JAR_FILE"
}

build_backend() {
    echo "=== 백엔드 빌드 중 ==="
    cd "$ROOT_DIR"
    
    # Java 버전 확인 및 설정 (Java 21 권장)
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo "⚠️  Java 17 이상이 필요합니다 (권장: Java 21). 현재 버전: $JAVA_VERSION"
        echo "Java 21로 전환 중..."
        
        # Java 21 우선, 없으면 Java 17 찾기
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
        elif [ -d "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home" ]; then
            export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 17로 전환: $JAVA_HOME"
        else
            echo "❌ Java 17 이상을 찾을 수 없습니다."
            echo "JAVA_HOME을 Java 17 이상(권장: Java 21)으로 설정하세요."
            exit 1
        fi
        
        # 변경된 Java 버전 확인
        NEW_JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
        echo "현재 Java 버전: $NEW_JAVA_VERSION"
    elif [ "$JAVA_VERSION" -lt 21 ]; then
        echo "ℹ️  현재 Java 버전: $JAVA_VERSION (권장: Java 21)"
        echo "Java 21로 전환 중..."
        
        # Java 21 찾기
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
            NEW_JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
            echo "현재 Java 버전: $NEW_JAVA_VERSION"
        else
            echo "⚠️  Java 21을 찾을 수 없습니다. 현재 Java $JAVA_VERSION을 사용합니다."
        fi
    else
        echo "✅ Java 21 사용 중 (버전: $JAVA_VERSION)"
    fi
    
    echo "JAR 파일 빌드 중 (테스트 포함)..."
    ./gradlew :mongddang-api:clean :mongddang-api:build
    
    if [ ! -f "$JAR_FILE" ]; then
        echo "❌ JAR 파일 빌드 실패"
        exit 1
    fi
    
    echo "✅ 백엔드 빌드 완료: $JAR_FILE"
}

build_all() {
    echo "=== 전체 빌드 시작 ==="
    echo "빌드 순서: 백엔드 -> 프론트엔드 서버 (프론트엔드 빌드는 Gradle이 자동 처리)"
    build_backend
    build_frontend_server
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
    
    # Java 버전 확인 및 설정 (Java 21 권장)
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo "⚠️  Java 17 이상이 필요합니다 (권장: Java 21). 현재 버전: $JAVA_VERSION"
        echo "Java 21로 전환 중..."
        
        # Java 21 우선, 없으면 Java 17 찾기
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
        elif [ -d "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home" ]; then
            export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 17로 전환: $JAVA_HOME"
        else
            echo "❌ Java 17 이상을 찾을 수 없습니다."
            echo "JAVA_HOME을 Java 17 이상(권장: Java 21)으로 설정하세요."
            exit 1
        fi
        
        # 변경된 Java 버전 확인
        NEW_JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
        echo "현재 Java 버전: $NEW_JAVA_VERSION"
    elif [ "$JAVA_VERSION" -lt 21 ]; then
        echo "ℹ️  현재 Java 버전: $JAVA_VERSION (권장: Java 21)"
        echo "Java 21로 전환 중..."
        
        # Java 21 찾기
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
            NEW_JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
            echo "현재 Java 버전: $NEW_JAVA_VERSION"
        else
            echo "⚠️  Java 21을 찾을 수 없습니다. 현재 Java $JAVA_VERSION을 사용합니다."
        fi
    else
        echo "✅ Java 21 사용 중 (버전: $JAVA_VERSION)"
    fi
    
    nohup java -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    echo "✅ 백엔드 서버가 시작되었습니다. (PID: $(cat $PID_FILE))"
    echo "📋 로그 확인: tail -f $LOG_FILE"
    echo "🌐 백엔드 서버: http://localhost:8080"
    
    # 시작 확인
    sleep 3
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "✅ 애플리케이션이 정상적으로 실행 중입니다."
    else
        echo "❌ 애플리케이션 시작 실패. 로그를 확인하세요: $LOG_FILE"
        exit 1
    fi
}

start_frontend() {
    if [ -f "$FRONTEND_PID_FILE" ] && ps -p $(cat "$FRONTEND_PID_FILE") > /dev/null 2>&1; then
        echo "⚠️  프론트엔드 서버가 이미 실행 중입니다. (PID: $(cat $FRONTEND_PID_FILE))"
        return
    fi
    
    if [ ! -f "$FRONTEND_JAR_FILE" ]; then
        echo "❌ 프론트엔드 서버 JAR 파일을 찾을 수 없습니다. 먼저 빌드하세요: ./deploy.sh build"
        exit 1
    fi
    
    echo "=== 프론트엔드 서버 시작 중 ==="
    cd "$ROOT_DIR"
    
    # Java 버전 확인 및 설정 (Java 21 권장)
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo "⚠️  Java 17 이상이 필요합니다 (권장: Java 21). 현재 버전: $JAVA_VERSION"
        echo "Java 21로 전환 중..."
        
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
        elif [ -d "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home" ]; then
            export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 17로 전환: $JAVA_HOME"
        else
            echo "❌ Java 17 이상을 찾을 수 없습니다."
            exit 1
        fi
    elif [ "$JAVA_VERSION" -lt 21 ]; then
        echo "ℹ️  현재 Java 버전: $JAVA_VERSION (권장: Java 21)"
        if [ -d "/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" ]; then
            export JAVA_HOME="/Users/kakao/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo "✅ Java 21로 전환: $JAVA_HOME"
        fi
    else
        echo "✅ Java 21 사용 중 (버전: $JAVA_VERSION)"
    fi
    
    nohup java -jar "$FRONTEND_JAR_FILE" > "$FRONTEND_LOG_FILE" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    
    echo "✅ 프론트엔드 서버가 시작되었습니다. (PID: $(cat $FRONTEND_PID_FILE))"
    echo "📋 로그 확인: tail -f $FRONTEND_LOG_FILE"
    echo "🌐 프론트엔드 서버: http://localhost:8081"
    
    # 시작 확인
    sleep 3
    if ps -p $(cat "$FRONTEND_PID_FILE") > /dev/null 2>&1; then
        echo "✅ 프론트엔드 서버가 정상적으로 실행 중입니다."
    else
        echo "❌ 프론트엔드 서버 시작 실패. 로그를 확인하세요: $FRONTEND_LOG_FILE"
        exit 1
    fi
}

stop_app() {
    if [ ! -f "$PID_FILE" ]; then
        echo "⚠️  백엔드 서버가 실행 중이 아닙니다."
    else
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "=== 백엔드 서버 종료 중 ==="
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
            
            echo "✅ 백엔드 서버가 종료되었습니다."
        else
            echo "⚠️  프로세스를 찾을 수 없습니다."
            rm "$PID_FILE"
        fi
    fi
}

stop_frontend() {
    if [ ! -f "$FRONTEND_PID_FILE" ]; then
        echo "⚠️  프론트엔드 서버가 실행 중이 아닙니다."
        return
    fi
    
    PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "=== 프론트엔드 서버 종료 중 ==="
        kill $PID
        rm "$FRONTEND_PID_FILE"
        
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
        
        echo "✅ 프론트엔드 서버가 종료되었습니다."
    else
        echo "⚠️  프로세스를 찾을 수 없습니다."
        rm "$FRONTEND_PID_FILE"
    fi
}

restart_app() {
    echo "=== 백엔드 서버 재시작 중 ==="
    stop_app
    sleep 2
    start_app
}

restart_frontend() {
    echo "=== 프론트엔드 서버 재시작 중 ==="
    stop_frontend
    sleep 2
    start_frontend
}

restart_all() {
    echo "=== 전체 서버 재시작 중 ==="
    stop_app
    stop_frontend
    sleep 2
    start_app
    start_frontend
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
    build-backend)
        build_backend
        ;;
    build-frontend-server)
        build_frontend_server
        ;;
    start)
        start_app
        ;;
    start-frontend)
        start_frontend
        ;;
    start-all)
        start_app
        start_frontend
        ;;
    stop)
        stop_app
        ;;
    stop-frontend)
        stop_frontend
        ;;
    stop-all)
        stop_app
        stop_frontend
        ;;
    restart)
        restart_all
        ;;
    restart-backend)
        restart_app
        ;;
    restart-frontend)
        restart_frontend
        ;;
    restart-all)
        restart_all
        ;;
    status)
        status_app
        ;;
    *)
        echo "사용법: $0 {build|build-backend|build-frontend-server|start|start-frontend|start-all|stop|stop-frontend|stop-all|restart|restart-backend|restart-frontend|restart-all|status}"
        echo ""
        echo "빌드 명령어:"
        echo "  build                  - 백엔드와 프론트엔드 서버 모두 빌드 (프론트엔드 빌드는 Gradle이 자동 처리)"
        echo "  build-backend          - 백엔드만 빌드"
        echo "  build-frontend-server  - 프론트엔드 서버만 빌드 (npm install과 빌드 포함)"
        echo ""
        echo "시작 명령어:"
        echo "  start                  - 백엔드 서버 시작 (8080)"
        echo "  start-frontend          - 프론트엔드 서버 시작 (8081)"
        echo "  start-all               - 백엔드와 프론트엔드 서버 모두 시작"
        echo ""
        echo "중지 명령어:"
        echo "  stop                   - 백엔드 서버 중지"
        echo "  stop-frontend           - 프론트엔드 서버 중지"
        echo "  stop-all                - 백엔드와 프론트엔드 서버 모두 중지"
        echo ""
        echo "재시작 명령어:"
        echo "  restart                - 백엔드와 프론트엔드 서버 모두 재시작"
        echo "  restart-backend         - 백엔드 서버만 재시작"
        echo "  restart-frontend        - 프론트엔드 서버만 재시작"
        echo "  restart-all             - 백엔드와 프론트엔드 서버 모두 재시작 (restart와 동일)"
        echo ""
        echo "기타:"
        echo "  status                 - 백엔드 서버 상태 확인"
        exit 1
        ;;
esac

