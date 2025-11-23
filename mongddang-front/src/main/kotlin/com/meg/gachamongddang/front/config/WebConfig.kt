package com.meg.gachamongddang.front.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpMethod
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver

@Configuration
class WebConfig(
    @Value("\${backend.url:http://localhost:8080}")
    private val backendUrl: String
) : WebMvcConfigurer {

    @Bean
    fun restTemplate(): RestTemplate {
        val factory = SimpleClientHttpRequestFactory()
        factory.setConnectTimeout(5000)
        factory.setReadTimeout(10000)
        val restTemplate = RestTemplate(factory)
        
        // multipart 요청 지원을 위한 MessageConverter 추가
        val messageConverters = restTemplate.messageConverters.toMutableList()
        messageConverters.add(org.springframework.http.converter.support.AllEncompassingFormHttpMessageConverter())
        restTemplate.messageConverters = messageConverters
        
        return restTemplate
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(false)
    }

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // 정적 리소스 서빙
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(object : PathResourceResolver() {
                override fun getResource(resourcePath: String, location: Resource): Resource? {
                    // API 경로는 제외 (프록시 컨트롤러가 처리)
                    if (resourcePath.startsWith("/api/")) {
                        return null
                    }
                    
                    // 업로드된 파일 경로는 제외 (프록시 컨트롤러가 처리)
                    if (resourcePath.startsWith("/uploads/")) {
                        return null
                    }
                    
                    val requestedResource = location.createRelative(resourcePath)
                    
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

