package com.meg.gachamongddang.server.controller.category

import com.meg.gachamongddang.server.dto.category.CategoryResponse
import com.meg.gachamongddang.server.service.category.CategoryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/categories")
class PublicCategoryController(
    private val categoryService: CategoryService
) {
    
    @GetMapping
    fun getCategories(): ResponseEntity<List<CategoryResponse>> {
        val categories = categoryService.getAllCategories()
        return ResponseEntity.ok(categories)
    }
}

