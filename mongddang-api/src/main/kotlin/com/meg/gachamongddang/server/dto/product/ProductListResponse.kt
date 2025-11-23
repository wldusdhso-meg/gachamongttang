package com.meg.gachamongddang.server.dto.product

import com.meg.gachamongddang.server.domain.product.Product
import org.springframework.data.domain.Page

data class ProductListResponse(
    val products: List<ProductResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int
) {
    companion object {
        fun from(page: Page<Product>): ProductListResponse {
            return ProductListResponse(
                products = page.content.map { ProductResponse.from(it) },
                totalElements = page.totalElements,
                totalPages = page.totalPages,
                currentPage = page.number,
                pageSize = page.size
            )
        }
    }
}

