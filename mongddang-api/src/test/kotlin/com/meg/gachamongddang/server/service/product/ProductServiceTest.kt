package com.meg.gachamongddang.server.service.product

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.domain.product.Product
import com.meg.gachamongddang.server.dto.product.CreateProductRequest
import com.meg.gachamongddang.server.dto.product.UpdateProductRequest
import com.meg.gachamongddang.server.repository.category.CategoryRepository
import com.meg.gachamongddang.server.repository.product.ProductRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockitoExtension::class)
class ProductServiceTest {

    @Mock
    private lateinit var productRepository: ProductRepository

    @Mock
    private lateinit var categoryRepository: CategoryRepository

    @InjectMocks
    private lateinit var productService: ProductService

    private lateinit var testCategory: Category
    private lateinit var testProduct: Product

    @BeforeEach
    fun setUp() {
        testCategory = Category(
            id = 1L,
            name = "ACCESSORY",
            displayName = "액세서리",
            displayOrder = 1
        )

        testProduct = Product(
            id = 1L,
            name = "테스트 상품",
            description = "테스트 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            category = testCategory,
            stock = 10,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }

    @Test
    fun `getAllProducts - 성공적으로 모든 상품 조회`() {
        // given
        val pageable = PageRequest.of(0, 20)
        val products = listOf(testProduct)
        val page = PageImpl(products, pageable, 1)
        whenever(productRepository.findAllActive(pageable)).thenReturn(page)

        // when
        val result = productService.getAllProducts()

        // then
        assertEquals(1, result.products.size)
        assertEquals(1L, result.totalElements)
        assertEquals(testProduct.name, result.products[0].name)
        verify(productRepository).findAllActive(pageable)
    }

    @Test
    fun `getProductById - 존재하는 상품 조회 성공`() {
        // given
        whenever(productRepository.findById(1L)).thenReturn(Optional.of(testProduct))

        // when
        val result = productService.getProductById(1L)

        // then
        assertEquals(testProduct.id, result.id)
        assertEquals(testProduct.name, result.name)
        verify(productRepository).findById(1L)
    }

    @Test
    fun `getProductById - 존재하지 않는 상품 조회 시 예외 발생`() {
        // given
        whenever(productRepository.findById(999L)).thenReturn(Optional.empty())

        // when & then
        assertThrows(IllegalArgumentException::class.java) {
            productService.getProductById(999L)
        }
        verify(productRepository).findById(999L)
    }

    @Test
    fun `getProductById - 삭제된 상품 조회 시 예외 발생`() {
        // given
        testProduct.softDelete()
        whenever(productRepository.findById(1L)).thenReturn(Optional.of(testProduct))

        // when & then
        assertThrows(IllegalArgumentException::class.java) {
            productService.getProductById(1L)
        }
    }

    @Test
    fun `searchProducts - 키워드로 검색`() {
        // given
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(listOf(testProduct), pageable, 1)
        whenever(productRepository.searchByName("테스트", pageable)).thenReturn(page)

        // when
        val result = productService.searchProducts(keyword = "테스트")

        // then
        assertEquals(1, result.products.size)
        verify(productRepository).searchByName("테스트", pageable)
    }

    @Test
    fun `searchProducts - 카테고리로 필터링`() {
        // given
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(listOf(testProduct), pageable, 1)
        whenever(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory))
        whenever(productRepository.findByCategory(testCategory, pageable)).thenReturn(page)

        // when
        val result = productService.searchProducts(categoryId = 1L)

        // then
        assertEquals(1, result.products.size)
        verify(categoryRepository).findById(1L)
        verify(productRepository).findByCategory(testCategory, pageable)
    }

    @Test
    fun `searchProducts - 카테고리와 키워드로 검색`() {
        // given
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(listOf(testProduct), pageable, 1)
        whenever(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory))
        whenever(productRepository.searchByCategoryAndName(testCategory, "테스트", pageable))
            .thenReturn(page)

        // when
        val result = productService.searchProducts(
            keyword = "테스트",
            categoryId = 1L
        )

        // then
        assertEquals(1, result.products.size)
        verify(categoryRepository).findById(1L)
        verify(productRepository).searchByCategoryAndName(testCategory, "테스트", pageable)
    }

    @Test
    fun `createProduct - 상품 생성 성공`() {
        // given
        val request = CreateProductRequest(
            name = "새 상품",
            description = "새 설명",
            price = BigDecimal("20000.00"),
            imageUrl = "http://example.com/new.jpg",
            categoryId = 2L,
            stock = 5
        )
        val category2 = Category(
            id = 2L,
            name = "STATIONERY",
            displayName = "문구",
            displayOrder = 2
        )
        val savedProduct = Product(
            id = 2L,
            name = request.name,
            description = request.description,
            price = request.price,
            imageUrl = request.imageUrl,
            category = category2,
            stock = request.stock
        )
        whenever(categoryRepository.findById(2L)).thenReturn(Optional.of(category2))
        whenever(productRepository.save(any())).thenReturn(savedProduct)

        // when
        val result = productService.createProduct(request)

        // then
        assertEquals(request.name, result.name)
        assertEquals(request.price, result.price)
        assertEquals(category2.id, result.categoryId)
        verify(categoryRepository).findById(2L)
        verify(productRepository).save(any())
    }

    @Test
    fun `updateProduct - 상품 수정 성공`() {
        // given
        val category2 = Category(
            id = 2L,
            name = "ETC",
            displayName = "기타",
            displayOrder = 3
        )
        val request = UpdateProductRequest(
            name = "수정된 상품",
            description = "수정된 설명",
            price = BigDecimal("15000.00"),
            imageUrl = "http://example.com/updated.jpg",
            categoryId = 2L,
            stock = 20
        )
        whenever(productRepository.findById(1L)).thenReturn(Optional.of(testProduct))
        whenever(categoryRepository.findById(2L)).thenReturn(Optional.of(category2))
        whenever(productRepository.save(any())).thenReturn(testProduct)

        // when
        val result = productService.updateProduct(1L, request)

        // then
        assertEquals(request.name, result.name)
        assertEquals(request.price, result.price)
        verify(productRepository).findById(1L)
        verify(categoryRepository).findById(2L)
        verify(productRepository).save(any())
    }

    @Test
    fun `updateProduct - 존재하지 않는 상품 수정 시 예외 발생`() {
        // given
        val request = UpdateProductRequest(
            name = "수정된 상품",
            description = null,
            price = BigDecimal("15000.00"),
            imageUrl = null,
            categoryId = 1L,
            stock = 20
        )
        whenever(productRepository.findById(999L)).thenReturn(Optional.empty())

        // when & then
        assertThrows(IllegalArgumentException::class.java) {
            productService.updateProduct(999L, request)
        }
        verify(productRepository, never()).save(any())
    }

    @Test
    fun `updateProduct - 삭제된 상품 수정 시 예외 발생`() {
        // given
        testProduct.softDelete()
        val request = UpdateProductRequest(
            name = "수정된 상품",
            description = null,
            price = BigDecimal("15000.00"),
            imageUrl = null,
            categoryId = 1L,
            stock = 20
        )
        whenever(productRepository.findById(1L)).thenReturn(Optional.of(testProduct))

        // when & then
        assertThrows(IllegalArgumentException::class.java) {
            productService.updateProduct(1L, request)
        }
        verify(productRepository, never()).save(any())
    }

    @Test
    fun `deleteProduct - 상품 삭제 성공`() {
        // given
        whenever(productRepository.findById(1L)).thenReturn(Optional.of(testProduct))
        whenever(productRepository.save(any())).thenReturn(testProduct)

        // when
        productService.deleteProduct(1L)

        // then
        assertTrue(testProduct.isDeleted)
        verify(productRepository).findById(1L)
        verify(productRepository).save(any())
    }

    @Test
    fun `deleteProduct - 존재하지 않는 상품 삭제 시 예외 발생`() {
        // given
        whenever(productRepository.findById(999L)).thenReturn(Optional.empty())

        // when & then
        assertThrows(IllegalArgumentException::class.java) {
            productService.deleteProduct(999L)
        }
        verify(productRepository, never()).save(any())
    }
}
