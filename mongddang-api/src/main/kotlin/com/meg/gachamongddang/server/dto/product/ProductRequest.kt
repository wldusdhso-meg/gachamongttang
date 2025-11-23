package com.meg.gachamongddang.server.dto.product

import jakarta.validation.constraints.*
import java.math.BigDecimal

data class CreateProductRequest(
    @field:NotBlank(message = "상품명은 필수입니다")
    @field:Size(max = 255, message = "상품명은 255자 이하여야 합니다")
    val name: String,
    
    val description: String? = null,
    
    val detailDescription: String? = null,
    
    @field:NotNull(message = "가격은 필수입니다")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다")
    val price: BigDecimal,
    
    val imageUrl: String? = null,
    
    @field:NotNull(message = "카테고리 ID는 필수입니다")
    val categoryId: Long,
    
    @field:NotNull(message = "재고는 필수입니다")
    @field:Min(value = 0, message = "재고는 0 이상이어야 합니다")
    val stock: Int = 0
)

typealias UpdateProductRequest = CreateProductRequest

