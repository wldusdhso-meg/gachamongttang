package com.meg.gachamongddang.server.dto.category

import com.meg.gachamongddang.server.domain.category.Category
import java.time.LocalDateTime

data class CategoryResponse(
    val id: Long,
    val name: String,
    val displayName: String,
    val displayOrder: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(category: Category): CategoryResponse {
            return CategoryResponse(
                id = category.id,
                name = category.name,
                displayName = category.displayName,
                displayOrder = category.displayOrder,
                createdAt = category.createdAt,
                updatedAt = category.updatedAt
            )
        }
    }
}

