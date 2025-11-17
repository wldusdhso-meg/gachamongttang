// 루트 프로젝트 빌드 설정
plugins {
	kotlin("jvm") version "1.9.25"
}

allprojects {
	group = "com.meg"
	version = "0.0.1-SNAPSHOT"
	
	repositories {
		mavenCentral()
	}
}

subprojects {
	apply(plugin = "org.jetbrains.kotlin.jvm")
	
	java {
		toolchain {
			languageVersion = JavaLanguageVersion.of(21)
		}
	}
	
	kotlin {
		compilerOptions {
			freeCompilerArgs.addAll("-Xjsr305=strict")
		}
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}
