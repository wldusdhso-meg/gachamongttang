package com.meg.gachamongddang.server.domain.product

import com.meg.gachamongddang.server.domain.category.Category
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime

class ProductTest {

    private lateinit var category: Category

    @BeforeEach
    fun setUp() {
        category = Category(
            id = 1L,
            name = "ACCESSORY",
            displayName = "액세서리",
            displayOrder = 1
        )
    }

    @Test
    fun `isDeleted - 삭제되지 않은 상품은 false 반환`() {
        // given
        val product = Product(
            name = "테스트 상품",
            description = "테스트 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            category = category,
            stock = 10
        )

        // when & then
        assertFalse(product.isDeleted)
        assertNull(product.deletedAt)
    }

    @Test
    fun `isDeleted - 삭제된 상품은 true 반환`() {
        // given
        val product = Product(
            name = "테스트 상품",
            description = "테스트 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            category = category,
            stock = 10
        )

        // when
        product.softDelete()

        // then
        assertTrue(product.isDeleted)
        assertNotNull(product.deletedAt)
    }

    @Test
    fun `softDelete - 삭제 시간 설정`() {
        // given
        val product = Product(
            name = "테스트 상품",
            description = "테스트 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            category = category,
            stock = 10
        )
        val beforeDelete = LocalDateTime.now()

        // when
        product.softDelete()

        // then
        assertNotNull(product.deletedAt)
        assertTrue(product.deletedAt!!.isAfter(beforeDelete) || product.deletedAt!!.isEqual(beforeDelete))
    }

    @Test
    fun `restore - 삭제 취소`() {
        // given
        val product = Product(
            name = "테스트 상품",
            description = "테스트 설명",
            price = BigDecimal("10000.00"),
            imageUrl = "http://example.com/image.jpg",
            category = category,
            stock = 10
        )
        product.softDelete()

        // when
        product.restore()

        // then
        assertFalse(product.isDeleted)
        assertNull(product.deletedAt)
    }
}
