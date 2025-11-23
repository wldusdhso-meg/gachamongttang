package com.meg.gachamongddang.server.controller.product

import com.meg.gachamongddang.server.dto.product.*
import com.meg.gachamongddang.server.service.FileStorageService
import com.meg.gachamongddang.server.service.product.ProductService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/admin/v1/products")
class ProductController(
    private val productService: ProductService,
    private val fileStorageService: FileStorageService
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
    
    @PostMapping
    fun createProduct(@Valid @RequestBody request: CreateProductRequest): ResponseEntity<ProductResponse> {
        val product = productService.createProduct(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(product)
    }
    
    @PutMapping("/{id}")
    fun updateProduct(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateProductRequest
    ): ResponseEntity<ProductResponse> {
        val product = productService.updateProduct(id, request)
        return ResponseEntity.ok(product)
    }
    
    @DeleteMapping("/{id}")
    fun deleteProduct(@PathVariable id: Long): ResponseEntity<Void> {
        productService.deleteProduct(id)
        return ResponseEntity.noContent().build()
    }
    
    @PostMapping("/upload")
    fun uploadImage(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        val imageUrl = fileStorageService.storeFile(file)
        return ResponseEntity.ok(mapOf("imageUrl" to imageUrl))
    }
}

