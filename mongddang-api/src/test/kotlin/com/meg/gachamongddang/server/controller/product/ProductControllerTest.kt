package com.meg.gachamongddang.server.controller.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.meg.gachamongddang.server.dto.product.*
import com.meg.gachamongddang.server.service.FileStorageService
import com.meg.gachamongddang.server.service.product.ProductService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.mockito.kotlin.*
import java.math.BigDecimal
import java.time.LocalDateTime

@WebMvcTest(ProductController::class)
class ProductControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var productService: ProductService

    @MockBean
    private lateinit var fileStorageService: FileStorageService

    @Test
    fun getProducts_상품목록조회성공() {
        // given
        val productResponse = ProductResponse(
            id = 1L,
            name = "테스트 상품",
            description = "테스트 설명",
            detailDescription = null,
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            categoryId = 1L,
            categoryName = "ACCESSORY",
            categoryDisplayName = "액세서리",
            stock = 10,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        val listResponse = ProductListResponse(
            products = listOf(productResponse),
            totalElements = 1L,
            totalPages = 1,
            currentPage = 0,
            pageSize = 20
        )
        whenever(productService.searchProducts(any(), any(), any(), any())).thenReturn(listResponse)

        // when & then
        mockMvc.perform(get("/admin/v1/products"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.products").isArray)
            .andExpect(jsonPath("$.products[0].name").value("테스트 상품"))
            .andExpect(jsonPath("$.totalElements").value(1))
    }

    @Test
    fun getProducts_카테고리필터링() {
        // given
        val listResponse = ProductListResponse(
            products = emptyList(),
            totalElements = 0L,
            totalPages = 0,
            currentPage = 0,
            pageSize = 20
        )
        whenever(productService.searchProducts(any(), eq(1L), any(), any()))
            .thenReturn(listResponse)

        // when & then
        mockMvc.perform(get("/admin/v1/products").param("categoryId", "1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(0))
    }

    @Test
    fun getProducts_검색키워드() {
        // given
        val listResponse = ProductListResponse(
            products = emptyList(),
            totalElements = 0L,
            totalPages = 0,
            currentPage = 0,
            pageSize = 20
        )
        whenever(productService.searchProducts(eq("테스트"), any(), any(), any()))
            .thenReturn(listResponse)

        // when & then
        mockMvc.perform(get("/admin/v1/products").param("search", "테스트"))
            .andExpect(status().isOk)
    }

    @Test
    fun getProduct_상품상세조회성공() {
        // given
        val productResponse = ProductResponse(
            id = 1L,
            name = "테스트 상품",
            description = "테스트 설명",
            detailDescription = null,
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            categoryId = 1L,
            categoryName = "ACCESSORY",
            categoryDisplayName = "액세서리",
            stock = 10,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        whenever(productService.getProductById(1L)).thenReturn(productResponse)

        // when & then
        mockMvc.perform(get("/admin/v1/products/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("테스트 상품"))
    }

    @Test
    fun createProduct_상품생성성공() {
        // given
        val request = CreateProductRequest(
            name = "새 상품",
            description = "새 설명",
            price = BigDecimal("20000.00"),
            imageUrl = "http://example.com/new.jpg",
            categoryId = 2L,
            stock = 5
        )
        val response = ProductResponse(
            id = 1L,
            name = request.name,
            description = request.description,
            detailDescription = request.detailDescription,
            price = request.price,
            imageUrl = request.imageUrl,
            categoryId = request.categoryId,
            categoryName = "STATIONERY",
            categoryDisplayName = "문구",
            stock = request.stock,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        whenever(productService.createProduct(any())).thenReturn(response)

        // when & then
        mockMvc.perform(
            post("/admin/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("새 상품"))
    }

    @Test
    fun createProduct_유효성검사실패() {
        // given
        val invalidRequest = CreateProductRequest(
            name = "", // 빈 문자열
            description = null,
            price = BigDecimal("-100"), // 음수
            imageUrl = null,
            categoryId = 0L, // 0은 유효하지 않음
            stock = -1 // 음수
        )

        // when & then
        mockMvc.perform(
            post("/admin/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun updateProduct_상품수정성공() {
        // given
        val request = UpdateProductRequest(
            name = "수정된 상품",
            description = "수정된 설명",
            price = BigDecimal("15000.00"),
            imageUrl = "http://example.com/updated.jpg",
            categoryId = 3L,
            stock = 20
        )
        val response = ProductResponse(
            id = 1L,
            name = request.name,
            description = request.description,
            detailDescription = request.detailDescription,
            price = request.price,
            imageUrl = request.imageUrl,
            categoryId = request.categoryId,
            categoryName = "ETC",
            categoryDisplayName = "기타",
            stock = request.stock,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        whenever(productService.updateProduct(eq(1L), any())).thenReturn(response)

        // when & then
        mockMvc.perform(
            put("/admin/v1/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("수정된 상품"))
    }

    @Test
    fun deleteProduct_상품삭제성공() {
        // given
        doNothing().whenever(productService).deleteProduct(1L)

        // when & then
        mockMvc.perform(delete("/admin/v1/products/1"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun uploadImage_이미지업로드성공() {
        // given
        val file = MockMultipartFile(
            "file",
            "test.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image content".toByteArray()
        )
        whenever(fileStorageService.storeFile(any())).thenReturn("/uploads/test-uuid.jpg")

        // when & then
        mockMvc.perform(
            multipart("/admin/v1/products/upload")
                .file(file)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.imageUrl").value("/uploads/test-uuid.jpg"))
    }
}
