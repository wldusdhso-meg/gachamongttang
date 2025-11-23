package com.meg.gachamongddang.server.domain.product

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ProductCategoryTest {

    @Test
    fun `fromString - 대소문자 구분 없이 찾기`() {
        // when & then
        assertEquals(ProductCategory.ACCESSORY, ProductCategory.fromString("ACCESSORY"))
        assertEquals(ProductCategory.ACCESSORY, ProductCategory.fromString("accessory"))
        assertEquals(ProductCategory.ACCESSORY, ProductCategory.fromString("Accessory"))
        assertEquals(ProductCategory.STATIONERY, ProductCategory.fromString("STATIONERY"))
        assertEquals(ProductCategory.ETC, ProductCategory.fromString("ETC"))
    }

    @Test
    fun `fromString - 존재하지 않는 값은 null 반환`() {
        // when & then
        assertNull(ProductCategory.fromString("INVALID"))
        assertNull(ProductCategory.fromString(""))
        assertNull(ProductCategory.fromString("unknown"))
    }

    @Test
    fun `displayName - 각 카테고리의 한글명 확인`() {
        // when & then
        assertEquals("액세서리", ProductCategory.ACCESSORY.displayName)
        assertEquals("문구", ProductCategory.STATIONERY.displayName)
        assertEquals("기타", ProductCategory.ETC.displayName)
    }
}

