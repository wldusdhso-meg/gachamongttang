# 프론트엔드 서버 분리 작업 계획

## 목표
- 프론트엔드 서버와 백엔드 서버를 완전히 분리
- 프론트엔드 서버: 8081 포트 (Kotlin Spring Boot)
- 백엔드 서버: 8080 포트 (기존 유지)
- 프론트엔드 서버는 정적 파일만 서빙하고, API 요청은 백엔드 서버로 프록시

## 현재 구조
```
mongddang-api (8080)
├── 정적 파일 서빙 (src/main/resources/static/)
├── API 서빙 (/admin/v1/*, /v1/*)
└── WebConfig에서 경로별로 분기 처리

mongddang-front/
└── web/ (클라이언트 코드)
```

## 변경 후 구조
```
mongddang-api (8080)
└── API만 서빙 (/admin/v1/*, /v1/*)

mongddang-front (8081) - Gradle 모듈
├── build/ (빌드 결과물)
├── src/ (Kotlin Spring Boot 서버 코드)
│   └── main/
│       ├── kotlin/ (서버 코드)
│       └── resources/
│           └── static/ (web/dist/* 복사됨)
├── web/ (기존 클라이언트 코드 그대로)
│   ├── src/
│   ├── dist/ (빌드 결과물)
│   └── package.json
└── build.gradle.kts
```

---

## 작업 단계

### Phase 1: mongddang-front를 Gradle 모듈로 변환

#### 1.1 모듈 디렉토리 구조 생성
- [ ] `mongddang-front/src/main/kotlin/` 디렉토리 생성
- [ ] `mongddang-front/src/main/resources/` 디렉토리 생성
- [ ] `mongddang-front/src/test/kotlin/` 디렉토리 생성
- [ ] `mongddang-front/web/` 디렉토리는 기존 그대로 유지

#### 1.2 build.gradle.kts 생성
- [ ] `mongddang-front/build.gradle.kts` 파일 생성
- [ ] Spring Boot Web 의존성 추가
- [ ] Kotlin 설정 추가
- [ ] 포트 8081 설정
- [ ] 프론트엔드 빌드 태스크 추가 (`npm run build` 실행 후 `web/dist/*` → `src/main/resources/static/` 복사)

#### 1.3 settings.gradle.kts 업데이트
- [ ] `include("mongddang-front")` 추가 (현재는 주석 처리되어 있거나 없을 수 있음)

#### 1.4 루트 build.gradle.kts 확인
- [ ] Java 21 toolchain 설정 확인
- [ ] subprojects 설정 확인

---

### Phase 2: 프론트엔드 서버 애플리케이션 구현

#### 2.1 메인 애플리케이션 클래스 생성
- [ ] `mongddang-front/src/main/kotlin/com/meg/gachamongddang/front/FrontServerApplication.kt` 생성
- [ ] `@SpringBootApplication` 어노테이션 추가
- [ ] `main` 함수 구현

#### 2.2 application.properties 생성
- [ ] `mongddang-front/src/main/resources/application.properties` 생성
- [ ] `server.port=8081` 설정
- [ ] 애플리케이션 이름 설정
- [ ] 로깅 설정
- [ ] 백엔드 서버 URL 설정 (예: `backend.url=http://localhost:8080`)

#### 2.3 WebConfig 생성 (API 프록시 설정)
- [ ] `mongddang-front/src/main/kotlin/com/meg/gachamongddang/front/config/WebConfig.kt` 생성
- [ ] 정적 리소스 핸들러 설정 (`classpath:/static/`)
- [ ] API 프록시 설정 (`/api/*` → `http://localhost:8080/*`)
- [ ] SPA 라우팅 지원 (모든 경로 → `index.html`)

#### 2.4 API 프록시 컨트롤러 생성 (또는 RestTemplate/WebClient 사용)
- [ ] `mongddang-front/src/main/kotlin/com/meg/gachamongddang/front/controller/ProxyController.kt` 생성
- [ ] 또는 `WebConfig`에서 `RestTemplate` 또는 `WebClient`를 사용한 프록시 설정
- [ ] `/api/**` 경로를 `http://localhost:8080/**`로 프록시

---

### Phase 3: 빌드 프로세스 수정

#### 3.1 mongddang-front/build.gradle.kts에 빌드 태스크 추가
- [ ] `buildFrontend` 태스크 추가
  - [ ] `web/` 디렉토리에서 `npm run build` 실행
  - [ ] `web/dist/*` 파일을 `src/main/resources/static/`로 복사
- [ ] `processResources` 태스크에 `buildFrontend` 의존성 추가
- [ ] 또는 `bootJar` 태스크에 `buildFrontend` 의존성 추가

#### 3.2 deploy.sh 수정
- [ ] `build_frontend()` 함수 수정
  - [ ] `mongddang-front` 모듈 빌드 시 자동으로 프론트엔드 빌드 및 복사됨
  - [ ] 또는 `./gradlew :mongddang-front:buildFrontend` 실행
- [ ] `build_backend()` 함수 수정
  - [ ] `mongddang-api`만 빌드하도록 수정
- [ ] `build_frontend_server()` 함수 추가
  - [ ] `mongddang-front` 모듈 빌드 (`./gradlew :mongddang-front:build`)
- [ ] `build_all()` 함수 수정
  - [ ] `build_frontend`, `build_backend`, `build_frontend_server` 순서로 실행
- [ ] `start_app()` 함수 수정
  - [ ] 백엔드 서버만 시작하도록 수정
- [ ] `start_frontend()` 함수 추가
  - [ ] 프론트엔드 서버 시작 (8081 포트)
  - [ ] JAR 파일 경로: `mongddang-front/build/libs/mongddang-front-*.jar`
- [ ] `stop_app()`, `restart_app()` 함수 수정
  - [ ] 프론트엔드 서버도 함께 관리

#### 3.2 mongddang-api의 WebConfig 수정
- [ ] 정적 리소스 핸들러 제거 (프론트엔드는 프론트 서버에서 서빙)
- [ ] API 경로만 남기기
- [ ] CORS 설정 추가 (8081 포트에서 오는 요청 허용)

---

### Phase 4: 프론트엔드 API 클라이언트 수정

#### 4.1 admin.ts 수정
- [ ] `ADMIN_API_BASE_URL`을 `/api/admin/v1`로 변경
- [ ] 프론트 서버(8081)에서 `/api/admin/v1/*`로 요청하면 프론트 서버가 백엔드(8080)로 프록시

#### 4.2 products.ts 수정
- [ ] `apiFetch`의 `API_BASE_URL`을 `/api/v1`로 변경

#### 4.3 categories.ts 수정
- [ ] `apiFetch`의 `API_BASE_URL`을 `/api/v1`로 변경

#### 4.4 client.ts 수정
- [ ] `API_BASE_URL`을 `/api/v1`로 변경

---

### Phase 5: Docker 설정 수정 (선택사항)

#### 5.1 Dockerfile.server 수정
- [ ] 프론트엔드 빌드 및 복사 로직 제거
- [ ] 백엔드만 빌드하도록 수정

#### 5.2 Dockerfile.frontend 수정
- [ ] Kotlin Spring Boot 기반으로 변경
- [ ] 또는 기존 Nginx 기반 유지 (프록시 설정만 추가)

#### 5.3 docker-compose.yml 수정
- [ ] `frontend` 서비스가 프론트엔드 서버(8081)를 가리키도록 수정
- [ ] `server` 서비스는 백엔드 서버(8080)만 가리키도록 수정

---

### Phase 6: 문서 업데이트

#### 6.1 README.md 업데이트
- [ ] 새로운 구조 설명 추가
- [ ] 실행 방법 업데이트
- [ ] 포트 정보 업데이트 (8080: 백엔드, 8081: 프론트엔드)

#### 6.2 PROJECT_STRUCTURE.md 업데이트
- [ ] `mongddang-front` 모듈 구조 설명 업데이트
  - [ ] `src/` 디렉토리 (Kotlin 서버 코드)
  - [ ] `web/` 디렉토리 (클라이언트 코드)
  - [ ] 빌드 프로세스 설명
- [ ] 모듈 간 의존성 설명 업데이트

#### 6.3 DEPLOY.md 업데이트
- [ ] 배포 프로세스 업데이트
- [ ] 프론트엔드 서버와 백엔드 서버 분리 설명

---

## 상세 구현 계획

### build.gradle.kts 예시

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.spring") version "1.9.20"
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "com.meg.gachamongddang"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "21"
    }
}

// 프론트엔드 빌드 태스크
tasks.register<Exec>("buildFrontend") {
    group = "build"
    description = "Build frontend React application"
    workingDir = file("web")
    commandLine("npm", "run", "build")
    
    doLast {
        // web/dist/* 를 src/main/resources/static/ 로 복사
        val distDir = file("web/dist")
        val staticDir = file("src/main/resources/static")
        
        if (distDir.exists()) {
            staticDir.mkdirs()
            copy {
                from(distDir)
                into(staticDir)
            }
            println("✅ Frontend files copied to static directory")
        } else {
            throw GradleException("Frontend build failed: dist directory not found")
        }
    }
}

// processResources 전에 프론트엔드 빌드 실행
tasks.named("processResources") {
    dependsOn("buildFrontend")
}

// bootJar 전에 프론트엔드 빌드 실행
tasks.named("bootJar") {
    dependsOn("buildFrontend")
}
```

### WebConfig 프록시 설정 예시

```kotlin
@Configuration
class WebConfig : WebMvcConfigurer {
    
    @Bean
    fun restTemplate(): RestTemplate {
        return RestTemplate()
    }
    
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // 정적 리소스 서빙
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(object : PathResourceResolver() {
                override fun getResource(resourcePath: String, location: Resource): Resource? {
                    // API 경로는 제외
                    if (resourcePath.startsWith("/api/")) {
                        return null
                    }
                    
                    val requestedResource = location.createRelative(resourcePath)
                    if (requestedResource.exists() && requestedResource.isReadable) {
                        return requestedResource
                    }
                    
                    // SPA 라우팅
                    return ClassPathResource("/static/index.html")
                }
            })
    }
    
    @Bean
    fun apiProxyController(restTemplate: RestTemplate): RouterFunction<ServerResponse> {
        return RouterFunctions.route()
            .route(RequestPredicates.path("/api/**")) { request ->
                val backendUrl = "http://localhost:8080${request.path().replace("/api", "")}"
                val response = restTemplate.exchange(
                    backendUrl,
                    HttpMethod.valueOf(request.method().name()),
                    HttpEntity(request.body(), request.headers().asHttpHeaders()),
                    String::class.java
                )
                ServerResponse.status(response.statusCode)
                    .headers { it.addAll(response.headers) }
                    .body(response.body ?: "")
            }
            .build()
    }
}
```

또는 더 간단하게 `@RestController`로:

```kotlin
@RestController
@RequestMapping("/api")
class ProxyController(
    private val restTemplate: RestTemplate
) {
    @RequestMapping("/**")
    fun proxy(@RequestHeader headers: HttpHeaders, @RequestBody body: Any?, request: HttpServletRequest): ResponseEntity<*> {
        val backendUrl = "http://localhost:8080${request.requestURI.replace("/api", "")}"
        val httpMethod = HttpMethod.valueOf(request.method)
        
        val entity = HttpEntity(body, headers)
        return restTemplate.exchange(backendUrl, httpMethod, entity, Any::class.java)
    }
}
```

---

## 체크리스트

### 필수 작업
- [ ] Phase 1: mongddang-front를 Gradle 모듈로 변환
- [ ] Phase 2: 프론트엔드 서버 애플리케이션 구현
- [ ] Phase 3: 빌드 프로세스 수정
- [ ] Phase 4: 프론트엔드 API 클라이언트 수정
- [ ] Phase 6: 문서 업데이트

### 선택 작업
- [ ] Phase 5: Docker 설정 수정

---

## 테스트 계획

1. **프론트엔드 서버 테스트**
   - [ ] `http://localhost:8081` 접속 시 정상 렌더링 확인
   - [ ] `http://localhost:8081/products` 접속 시 정상 렌더링 확인
   - [ ] `http://localhost:8081/admin/products` 접속 시 정상 렌더링 확인

2. **API 프록시 테스트**
   - [ ] `http://localhost:8081/api/v1/products` → `http://localhost:8080/v1/products` 프록시 확인
   - [ ] `http://localhost:8081/api/admin/v1/products` → `http://localhost:8080/admin/v1/products` 프록시 확인
   - [ ] POST, PUT, DELETE 요청도 정상 프록시 확인

3. **백엔드 서버 테스트**
   - [ ] `http://localhost:8080/v1/products` 직접 접속 시 API 응답 확인
   - [ ] `http://localhost:8080/admin/v1/products` 직접 접속 시 API 응답 확인

4. **통합 테스트**
   - [ ] 프론트엔드에서 상품 목록 조회 정상 동작 확인
   - [ ] 프론트엔드에서 상품 등록/수정/삭제 정상 동작 확인
   - [ ] 프론트엔드에서 카테고리 관리 정상 동작 확인

---

## 주의사항

1. **CORS 설정**: 백엔드 서버에서 8081 포트의 요청을 허용하도록 CORS 설정 필요
2. **프록시 경로**: `/api/*` → `/api`를 제거하고 백엔드로 전달해야 함
3. **에러 처리**: 프록시 실패 시 적절한 에러 응답 처리
4. **환경 변수**: 백엔드 서버 URL을 환경 변수로 설정 가능하도록 구성

---

## 예상 소요 시간

- Phase 1: 30분
- Phase 2: 1시간
- Phase 3: 1시간
- Phase 4: 30분
- Phase 5: 30분 (선택)
- Phase 6: 30분

**총 예상 시간: 3.5 ~ 4시간**

