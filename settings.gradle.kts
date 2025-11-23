rootProject.name = "gachamongddang"

// 모듈 구성
include("common")           // 공통 모듈 (도메인 모델, 공통 로직)
include("mongddang-api")     // API 서버
include("mongddang-front")   // 프론트엔드 서버
// include("mongddang-admin") // 어드민 프론트엔드 (나중에 추가)
// include("mongddang-papi") // 어드민 API 서버 (나중에 추가)
