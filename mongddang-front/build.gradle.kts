// mongddang-front 모듈 (프론트엔드 서버)
plugins {
    kotlin("jvm")
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.5.5"
    id("io.spring.dependency-management") version "1.1.7"
}

description = "gachamongddang Frontend server"

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
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

