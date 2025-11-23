package com.meg.gachamongddang.server.dto.product

import com.meg.gachamongddang.server.domain.product.Product
import java.math.BigDecimal
import java.time.LocalDateTime

data class ProductResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val detailDescription: String?,
    val price: BigDecimal,
    val imageUrl: String?,
    val categoryId: Long,
    val categoryName: String,
    val categoryDisplayName: String,
    val stock: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(product: Product): ProductResponse {
            return ProductResponse(
                id = product.id,
                name = product.name,
                description = product.description,
                detailDescription = product.detailDescription,
                price = product.price,
                imageUrl = product.imageUrl,
                categoryId = product.category.id,
                categoryName = product.category.name,
                categoryDisplayName = product.category.displayName,
                stock = product.stock,
                createdAt = product.createdAt,
                updatedAt = product.updatedAt
            )
        }
    }
}
