package com.meg.gachamongddang.server.repository.product

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.domain.product.Product
import com.meg.gachamongddang.server.repository.category.CategoryRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal

@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var categoryRepository: CategoryRepository

    private lateinit var category1: Category
    private lateinit var category2: Category
    private lateinit var category3: Category
    private lateinit var product1: Product
    private lateinit var product2: Product
    private lateinit var deletedProduct: Product

    @BeforeEach
    fun setUp() {
        categoryRepository.deleteAll()
        productRepository.deleteAll()

        category1 = Category(
            name = "ACCESSORY",
            displayName = "액세서리",
            displayOrder = 1
        )
        category2 = Category(
            name = "STATIONERY",
            displayName = "문구",
            displayOrder = 2
        )
        category3 = Category(
            name = "ETC",
            displayName = "기타",
            displayOrder = 3
        )
        categoryRepository.saveAll(listOf(category1, category2, category3))

        product1 = Product(
            name = "액세서리 상품",
            description = "액세서리 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/1.jpg",
            category = category1,
            stock = 10
        )

        product2 = Product(
            name = "문구 상품",
            description = "문구 설명",
            price = BigDecimal("5000.00"),
            imageUrl = "http://example.com/2.jpg",
            category = category2,
            stock = 20
        )

        deletedProduct = Product(
            name = "삭제된 상품",
            description = "삭제된 설명",
            price = BigDecimal("3000.00"),
            imageUrl = null,
            category = category3,
            stock = 5
        )
        deletedProduct.softDelete()

        productRepository.saveAll(listOf(product1, product2, deletedProduct))
    }

    @Test
    fun `findAllActive - 삭제되지 않은 상품만 조회`() {
        // when
        val result = productRepository.findAllActive(PageRequest.of(0, 10))

        // then
        assertEquals(2, result.totalElements)
        assertTrue(result.content.all { !it.isDeleted })
    }

    @Test
    fun `findByCategory - 카테고리별 조회`() {
        // when
        val result = productRepository.findByCategory(category1, PageRequest.of(0, 10))

        // then
        assertEquals(1, result.totalElements)
        assertEquals(category1.id, result.content[0].category.id)
        assertFalse(result.content[0].isDeleted)
    }

    @Test
    fun `searchByName - 이름으로 검색`() {
        // when
        val result = productRepository.searchByName("액세서리", PageRequest.of(0, 10))

        // then
        assertEquals(1, result.totalElements)
        assertTrue(result.content[0].name.contains("액세서리"))
        assertFalse(result.content[0].isDeleted)
    }

    @Test
    fun `searchByName - 부분 일치 검색`() {
        // when
        val result = productRepository.searchByName("상품", PageRequest.of(0, 10))

        // then
        assertEquals(2, result.totalElements)
        assertTrue(result.content.all { it.name.contains("상품") })
    }

    @Test
    fun `searchByCategoryAndName - 카테고리와 이름으로 검색`() {
        // when
        val result = productRepository.searchByCategoryAndName(
            category2,
            "문구",
            PageRequest.of(0, 10)
        )

        // then
        assertEquals(1, result.totalElements)
        assertEquals(category2.id, result.content[0].category.id)
        assertTrue(result.content[0].name.contains("문구"))
    }

    @Test
    fun `findAllActive - 삭제된 상품은 제외`() {
        // when
        val result = productRepository.findAllActive(PageRequest.of(0, 10))

        // then
        assertFalse(result.content.any { it.id == deletedProduct.id })
    }
}
