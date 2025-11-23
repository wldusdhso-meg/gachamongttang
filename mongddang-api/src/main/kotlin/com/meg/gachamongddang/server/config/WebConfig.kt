package com.meg.gachamongddang.server.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {

	override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
		// 업로드된 파일 서빙
		registry.addResourceHandler("/uploads/**")
			.addResourceLocations("file:uploads/")
	}
	
	override fun addCorsMappings(registry: CorsRegistry) {
		// 프론트엔드 서버(8081)에서 오는 요청 허용
		registry.addMapping("/**")
			.allowedOrigins("http://localhost:8081")
			.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
			.allowedHeaders("*")
			.allowCredentials(false)
	}
}

