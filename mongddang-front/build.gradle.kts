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

// npm install 태스크
tasks.register<Exec>("npmInstall") {
    group = "build"
    description = "Install npm dependencies"
    workingDir = file("web")
    
    // 운영서버에서도 확실하게 설치되도록 --legacy-peer-deps 사용
    // node_modules가 없거나 package.json이 변경된 경우에만 실행
    inputs.file("web/package.json")
    inputs.file("web/package-lock.json")
    outputs.dir("web/node_modules")
    
    // 운영서버에서도 확실하게 설치되도록 --legacy-peer-deps 사용
    if (System.getProperty("os.name").contains("Windows")) {
        commandLine("cmd", "/c", "npm", "install", "--legacy-peer-deps")
    } else {
        commandLine("npm", "install", "--legacy-peer-deps")
    }
    
    // 에러 발생 시 상세 로그 출력
    isIgnoreExitValue = false
}

// 프론트엔드 빌드 태스크
tasks.register<Exec>("buildFrontend") {
    group = "build"
    description = "Build frontend React application"
    dependsOn("npmInstall")
    workingDir = file("web")
    
    // npm install이 완료되었는지 확인
    doFirst {
        val nodeModules = file("web/node_modules/react-quill")
        if (!nodeModules.exists()) {
            throw GradleException("react-quill이 설치되지 않았습니다. npm install을 먼저 실행하세요.")
        }
        println("✅ react-quill 모듈 확인: ${nodeModules.absolutePath}")
    }
    
    commandLine("npm", "run", "build")
    
    inputs.dir("web/src")
    inputs.file("web/package.json")
    inputs.file("web/tsconfig.json")
    inputs.file("web/vite.config.ts")
    inputs.dir("web/node_modules")
    outputs.dir("web/dist")
    
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

