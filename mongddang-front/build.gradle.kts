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
tasks.register("npmInstall") {
    group = "build"
    description = "Install npm dependencies"
    
    // package.json과 package-lock.json을 inputs로 설정
    inputs.file("web/package.json")
    inputs.file("web/package-lock.json")
    
    // npm ci가 생성하는 .package-lock.json을 outputs로 사용
    // 이 파일이 있으면 npm ci가 성공적으로 실행된 것으로 간주
    outputs.file("web/node_modules/.package-lock.json")
    
    // node_modules 디렉토리도 outputs로 추가 (하지만 .package-lock.json이 더 정확함)
    outputs.dir("web/node_modules")
    
    // package-lock.json이 변경되었거나 .package-lock.json이 없으면 실행
    outputs.upToDateWhen {
        val packageLockHash = file("web/package-lock.json").let { 
            if (it.exists()) it.hashCode() else 0 
        }
        val installedLock = file("web/node_modules/.package-lock.json")
        
        // .package-lock.json이 있고, package-lock.json이 변경되지 않았을 때만 up-to-date
        val isUpToDate = installedLock.exists()
        
        if (!isUpToDate) {
            println("⚠️  node_modules/.package-lock.json이 없습니다. npm install을 실행합니다.")
        }
        
        return@upToDateWhen isUpToDate
    }
    
    doLast {
        val webDir = file("web")
        val packageLock = file("web/package-lock.json")
        
        // package-lock.json이 없으면 npm install, 있으면 npm ci
        try {
            if (packageLock.exists()) {
                println("📦 package-lock.json 발견. npm ci 실행 중...")
                exec {
                    workingDir = webDir
                    if (System.getProperty("os.name").contains("Windows")) {
                        commandLine("cmd", "/c", "npm", "ci", "--legacy-peer-deps")
                    } else {
                        commandLine("npm", "ci", "--legacy-peer-deps")
                    }
                    isIgnoreExitValue = false
                }
            } else {
                println("⚠️  package-lock.json이 없습니다. npm install 실행 중...")
                exec {
                    workingDir = webDir
                    if (System.getProperty("os.name").contains("Windows")) {
                        commandLine("cmd", "/c", "npm", "install", "--legacy-peer-deps")
                    } else {
                        commandLine("npm", "install", "--legacy-peer-deps")
                    }
                    isIgnoreExitValue = false
                }
            }
        } catch (e: Exception) {
            throw GradleException(
                "npm install 실패: ${e.message}\n" +
                "수동으로 'cd ${webDir.absolutePath} && npm install --legacy-peer-deps'를 실행해보세요.",
                e
            )
        }
        
        // npm install 완료 후 react-quill 설치 확인
        val reactQuillDir = file("web/node_modules/react-quill")
        val reactQuillTypes = file("web/node_modules/react-quill/lib/index.d.ts")
        val reactQuillMain = file("web/node_modules/react-quill/lib/index.js")
        val nodeModules = file("web/node_modules")
        
        // node_modules 전체 확인
        if (!nodeModules.exists()) {
            throw GradleException(
                "node_modules 디렉토리가 생성되지 않았습니다: ${nodeModules.absolutePath}\n" +
                "npm install이 실패했을 수 있습니다. 수동으로 'cd ${webDir.absolutePath} && npm install --legacy-peer-deps'를 실행해보세요."
            )
        }
        
        // react-quill 확인
        if (!reactQuillDir.exists()) {
            throw GradleException(
                "react-quill 디렉토리가 없습니다: ${reactQuillDir.absolutePath}\n" +
                "package.json에 react-quill이 있는지 확인하고, 수동으로 'cd ${webDir.absolutePath} && npm install --legacy-peer-deps'를 실행해보세요."
            )
        }
        if (!reactQuillTypes.exists()) {
            throw GradleException(
                "react-quill 타입 정의 파일이 없습니다: ${reactQuillTypes.absolutePath}\n" +
                "react-quill 설치가 불완전합니다. 수동으로 'cd ${webDir.absolutePath} && npm install react-quill --legacy-peer-deps'를 실행해보세요."
            )
        }
        if (!reactQuillMain.exists()) {
            throw GradleException(
                "react-quill 메인 파일이 없습니다: ${reactQuillMain.absolutePath}\n" +
                "react-quill 설치가 불완전합니다. 수동으로 'cd ${webDir.absolutePath} && npm install react-quill --legacy-peer-deps'를 실행해보세요."
            )
        }
        println("✅ react-quill 설치 확인 완료:")
        println("   - 디렉토리: ${reactQuillDir.absolutePath}")
        println("   - 타입 파일: ${reactQuillTypes.absolutePath}")
        println("   - 메인 파일: ${reactQuillMain.absolutePath}")
    }
}

// 프론트엔드 빌드 태스크
tasks.register<Exec>("buildFrontend") {
    group = "build"
    description = "Build frontend React application"
    dependsOn("npmInstall")
    workingDir = file("web")
    
    // npm install이 완료되었는지 확인
    doFirst {
        val nodeModules = file("web/node_modules")
        val reactQuillDir = file("web/node_modules/react-quill")
        val reactQuillTypes = file("web/node_modules/react-quill/lib/index.d.ts")
        val reactQuillMain = file("web/node_modules/react-quill/lib/index.js")
        val quillDir = file("web/node_modules/quill")
        
        if (!nodeModules.exists()) {
            throw GradleException("node_modules 디렉토리가 없습니다: ${nodeModules.absolutePath}")
        }
        if (!reactQuillDir.exists()) {
            throw GradleException("react-quill이 설치되지 않았습니다: ${reactQuillDir.absolutePath}")
        }
        if (!reactQuillTypes.exists()) {
            throw GradleException("react-quill 타입 정의 파일이 없습니다: ${reactQuillTypes.absolutePath}")
        }
        if (!reactQuillMain.exists()) {
            throw GradleException("react-quill 메인 파일이 없습니다: ${reactQuillMain.absolutePath}")
        }
        if (!quillDir.exists()) {
            throw GradleException("quill이 설치되지 않았습니다: ${quillDir.absolutePath}")
        }
        
        println("✅ 빌드 전 의존성 확인 완료:")
        println("   - node_modules: ${nodeModules.absolutePath}")
        println("   - react-quill: ${reactQuillDir.absolutePath}")
        println("   - react-quill/lib/index.js: ${reactQuillMain.absolutePath}")
        println("   - quill: ${quillDir.absolutePath}")
    }
    
    // 환경 변수 설정 (Vite가 node_modules를 찾을 수 있도록)
    environment("NODE_PATH", file("web").absolutePath)
    environment("NODE_ENV", "production")
    
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

