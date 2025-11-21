.PHONY: build build-server build-frontend up down logs clean

# 전체 빌드
build:
	docker-compose build

# 서버만 빌드
build-server:
	docker build -f Dockerfile.server -t gachamongddang-server .

# 프론트엔드만 빌드
build-frontend:
	docker build -f Dockerfile.frontend -t gachamongddang-frontend .

# 서비스 시작
up:
	docker-compose up -d

# 서비스 중지
down:
	docker-compose down

# 로그 확인
logs:
	docker-compose logs -f

# 서버 로그만
logs-server:
	docker-compose logs -f server

# 프론트엔드 로그만
logs-frontend:
	docker-compose logs -f frontend

# 정리 (컨테이너, 이미지, 볼륨 삭제)
clean:
	docker-compose down -v
	docker rmi gachamongddang-server gachamongddang-frontend || true

# 재빌드 및 재시작
rebuild:
	docker-compose build --no-cache
	docker-compose up -d

# 개발 환경 (서버만 도커)
dev:
	docker-compose -f docker-compose.dev.yml up -d

# 상태 확인
ps:
	docker-compose ps


