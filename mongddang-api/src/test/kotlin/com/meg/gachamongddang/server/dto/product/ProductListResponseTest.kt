package com.meg.gachamongddang.server.dto.product

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.domain.product.Product
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal
import java.time.LocalDateTime

class ProductListResponseTest {

    @Test
    fun `from - Page를 ProductListResponse로 변환`() {
        // given
        val category1 = Category(
            id = 1L,
            name = "ACCESSORY",
            displayName = "액세서리",
            displayOrder = 1
        )
        val category2 = Category(
            id = 2L,
            name = "STATIONERY",
            displayName = "문구",
            displayOrder = 2
        )
        val products = listOf(
            Product(
                id = 1L,
                name = "상품1",
                description = "설명1",
                price = BigDecimal("10000.00"),
                imageUrl = null,
                category = category1,
                stock = 10,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            ),
            Product(
                id = 2L,
                name = "상품2",
                description = "설명2",
                price = BigDecimal("20000.00"),
                imageUrl = null,
                category = category2,
                stock = 20,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
        )
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(products, pageable, 2)

        // when
        val response = ProductListResponse.from(page)

        // then
        assertEquals(2, response.products.size)
        assertEquals(2L, response.totalElements)
        assertEquals(1, response.totalPages)
        assertEquals(0, response.currentPage)
        assertEquals(20, response.pageSize)
        assertEquals("상품1", response.products[0].name)
        assertEquals("상품2", response.products[1].name)
    }

    @Test
    fun `from - 빈 페이지 처리`() {
        // given
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl<Product>(emptyList(), pageable, 0)

        // when
        val response = ProductListResponse.from(page)

        // then
        assertTrue(response.products.isEmpty())
        assertEquals(0L, response.totalElements)
        assertEquals(0, response.totalPages)
    }
}
