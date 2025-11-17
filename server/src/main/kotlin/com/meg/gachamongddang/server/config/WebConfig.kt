package com.meg.gachamongddang.server.config

import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver

@Configuration
class WebConfig : WebMvcConfigurer {

	override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
		registry.addResourceHandler("/**")
			.addResourceLocations("classpath:/static/")
			.resourceChain(true)
			.addResolver(object : PathResourceResolver() {
				override fun getResource(resourcePath: String, location: Resource): Resource? {
					val requestedResource = location.createRelative(resourcePath)
					
					// API 경로는 제외
					if (resourcePath.startsWith("/v1/") || resourcePath.startsWith("/api/")) {
						return null
					}
					
					// 파일이 존재하면 반환
					if (requestedResource.exists() && requestedResource.isReadable) {
						return requestedResource
					}
					
					// 파일이 없으면 index.html 반환 (SPA 라우팅)
					return ClassPathResource("/static/index.html")
				}
			})
	}
}

