// common 모듈 - 공통 도메인 모델 및 로직
plugins {
	kotlin("jvm")
}

description = "gachamongddang common module"

dependencies {
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	
	// 공통 유틸리티
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
}

