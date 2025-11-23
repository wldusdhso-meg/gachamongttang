package com.meg.gachamongddang.server.dto.category

import jakarta.validation.constraints.*

data class CreateCategoryRequest(
    @field:NotBlank(message = "카테고리명은 필수입니다")
    @field:Size(max = 100, message = "카테고리명은 100자 이하여야 합니다")
    val name: String,

    @field:NotBlank(message = "표시명은 필수입니다")
    @field:Size(max = 100, message = "표시명은 100자 이하여야 합니다")
    val displayName: String,

    @field:NotNull(message = "표시 순서는 필수입니다")
    @field:Min(value = 0, message = "표시 순서는 0 이상이어야 합니다")
    val displayOrder: Int = 0
)

typealias UpdateCategoryRequest = CreateCategoryRequest

