package com.meg.gachamongddang.server.controller.product

import com.meg.gachamongddang.server.dto.product.*
import com.meg.gachamongddang.server.service.product.ProductService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/products")
class PublicProductController(
    private val productService: ProductService
) {
    
    @GetMapping
    fun getProducts(
        @RequestParam(required = false) page: Int?,
        @RequestParam(required = false) size: Int?,
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ProductListResponse> {
        val result = productService.searchProducts(
            keyword = search,
            categoryId = categoryId,
            page = page ?: 0,
            size = size ?: 20
        )
        return ResponseEntity.ok(result)
    }
    
    @GetMapping("/{id}")
    fun getProduct(@PathVariable id: Long): ResponseEntity<ProductResponse> {
        val product = productService.getProductById(id)
        return ResponseEntity.ok(product)
    }
}

