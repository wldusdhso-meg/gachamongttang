package com.meg.gachamongddang.server.dto.product

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.domain.product.Product
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime

class ProductResponseTest {

    @Test
    fun `from - Product 엔티티를 ProductResponse로 변환`() {
        // given
        val category = Category(
            id = 1L,
            name = "ACCESSORY",
            displayName = "액세서리",
            displayOrder = 1
        )
        val product = Product(
            id = 1L,
            name = "테스트 상품",
            description = "테스트 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            category = category,
            stock = 10,
            createdAt = LocalDateTime.of(2024, 1, 1, 0, 0),
            updatedAt = LocalDateTime.of(2024, 1, 2, 0, 0)
        )

        // when
        val response = ProductResponse.from(product)

        // then
        assertEquals(product.id, response.id)
        assertEquals(product.name, response.name)
        assertEquals(product.description, response.description)
        assertEquals(product.price, response.price)
        assertEquals(product.imageUrl, response.imageUrl)
        assertEquals(category.id, response.categoryId)
        assertEquals(category.name, response.categoryName)
        assertEquals(category.displayName, response.categoryDisplayName)
        assertEquals(product.stock, response.stock)
        assertEquals(product.createdAt, response.createdAt)
        assertEquals(product.updatedAt, response.updatedAt)
    }

    @Test
    fun `from - null 필드 처리`() {
        // given
        val category = Category(
            id = 1L,
            name = "ACCESSORY",
            displayName = "액세서리",
            displayOrder = 1
        )
        val product = Product(
            id = 1L,
            name = "테스트 상품",
            description = null,
            price = BigDecimal("10000.00"),
            imageUrl = null,
            category = category,
            stock = 10,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        // when
        val response = ProductResponse.from(product)

        // then
        assertNull(response.description)
        assertNull(response.imageUrl)
    }
}
