package com.meg.gachamongddang.front.controller

import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.*
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest
import java.net.URI

@RestController
class ProxyController(
    private val restTemplate: RestTemplate,
    @Value("\${backend.url:http://localhost:8080}")
    private val backendUrl: String
) {
    
    @RequestMapping("/uploads/**")
    fun proxyUploads(request: HttpServletRequest): ResponseEntity<*> {
        // /uploads 경로를 백엔드로 프록시
        val path = request.requestURI
        val queryString = request.queryString
        val fullUrl = "$backendUrl$path${if (queryString != null) "?$queryString" else ""}"
        
        return try {
            val headers = HttpHeaders()
            request.headerNames.asIterator().forEach { headerName ->
                val lowerKey = headerName.lowercase()
                if (!lowerKey.equals("host", ignoreCase = true) &&
                    !lowerKey.equals("connection", ignoreCase = true)) {
                    headers[headerName] = request.getHeaders(headerName).toList()
                }
            }
            
            val httpMethod = HttpMethod.valueOf(request.method)
            val entity = HttpEntity<Any?>(null, headers)
            val response = restTemplate.exchange(
                URI(fullUrl),
                httpMethod,
                entity,
                org.springframework.core.io.Resource::class.java
            )
            
            val responseHeaders = HttpHeaders()
            response.headers.forEach { (key, values) ->
                val lowerKey = key.lowercase()
                if (!lowerKey.equals("transfer-encoding", ignoreCase = true) &&
                    !lowerKey.equals("connection", ignoreCase = true)) {
                    responseHeaders[key] = values
                }
            }
            
            // Resource를 ByteArray로 변환
            val resource = response.body
            val bytes = resource?.inputStream?.readAllBytes() ?: byteArrayOf()
            
            ResponseEntity.status(response.statusCode)
                .headers(responseHeaders)
                .body(bytes)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("""{"error":"Proxy error: ${e.message}"}""".toByteArray())
        }
    }
    
    @RequestMapping(
        value = ["/api/**"],
        consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE]
    )
    fun proxy(
        request: HttpServletRequest
    ): ResponseEntity<*> {
        // /api 제거하고 백엔드 URL로 프록시
        // 예: /api/v1/products -> /v1/products
        // 예: /api/admin/v1/products -> /admin/v1/products
        val path = request.requestURI.replaceFirst("/api", "")
        val queryString = request.queryString
        val fullUrl = "$backendUrl$path${if (queryString != null) "?$queryString" else ""}"
        
        val httpMethod = HttpMethod.valueOf(request.method)
        
        // multipart 요청인지 확인
        val isMultipart = request.contentType?.startsWith("multipart/form-data") == true
        
        return try {
            val response = if (isMultipart && request is MultipartHttpServletRequest) {
                // multipart 요청 처리
                val multipartRequest = request as MultipartHttpServletRequest
                val body = LinkedMultiValueMap<String, Any>()
                
                // 파일 파라미터 추가
                multipartRequest.fileMap.forEach { (key, file) ->
                    val multipartFile = file as MultipartFile
                    val filename = multipartFile.originalFilename ?: "file"
                    // ByteArrayResource에 파일명을 포함하여 생성
                    val fileResource = object : ByteArrayResource(multipartFile.bytes) {
                        override fun getFilename(): String = filename
                    }
                    body.add(key, fileResource)
                }
                
                // 일반 파라미터 추가
                multipartRequest.parameterMap.forEach { (key, values) ->
                    if (!multipartRequest.fileMap.containsKey(key)) {
                        values.forEach { value ->
                            body.add(key, value)
                        }
                    }
                }
                
                // Content-Type은 RestTemplate이 자동으로 설정 (boundary 포함)
                val headers = HttpHeaders()
                val entity = HttpEntity<MultiValueMap<String, Any>>(body, headers)
                restTemplate.exchange(
                    URI(fullUrl),
                    httpMethod,
                    entity,
                    String::class.java
                )
            } else {
                // 일반 요청 처리
                val headers = HttpHeaders()
                request.headerNames.asIterator().forEach { headerName ->
                    val lowerKey = headerName.lowercase()
                    if (!lowerKey.equals("host", ignoreCase = true) &&
                        !lowerKey.equals("connection", ignoreCase = true) &&
                        !lowerKey.equals("content-length", ignoreCase = true) &&
                        !lowerKey.equals("transfer-encoding", ignoreCase = true)) {
                        headers[headerName] = request.getHeaders(headerName).toList()
                    }
                }
                
                // body 읽기
                val body = if (request.contentLengthLong > 0) {
                    request.inputStream.readAllBytes()
                } else {
                    null
                }
                
                val entity = HttpEntity(body, headers)
                restTemplate.exchange(
                    URI(fullUrl),
                    httpMethod,
                    entity,
                    String::class.java
                )
            }
            
            // 응답 헤더 설정 (Transfer-Encoding 제외)
            val responseHeaders = HttpHeaders()
            response.headers.forEach { (key, values) ->
                val lowerKey = key.lowercase()
                if (!lowerKey.equals("transfer-encoding", ignoreCase = true) &&
                    !lowerKey.equals("connection", ignoreCase = true)) {
                    responseHeaders[key] = values
                }
            }
            
            ResponseEntity.status(response.statusCode)
                .headers(responseHeaders)
                .body(response.body)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("""{"error":"Proxy error: ${e.message}"}""")
        }
    }
}

