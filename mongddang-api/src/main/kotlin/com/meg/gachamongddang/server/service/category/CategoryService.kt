package com.meg.gachamongddang.server.service.category

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.dto.category.*
import com.meg.gachamongddang.server.repository.category.CategoryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class CategoryService(
    private val categoryRepository: CategoryRepository
) {

    fun getAllCategories(): List<CategoryResponse> {
        return categoryRepository.findAllActive()
            .map { CategoryResponse.from(it) }
    }

    fun getCategoryById(id: Long): CategoryResponse {
        val category = categoryRepository.findById(id)
            .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: $id") }

        if (category.isDeleted) {
            throw IllegalArgumentException("삭제된 카테고리입니다: $id")
        }

        return CategoryResponse.from(category)
    }

    fun createCategory(request: CreateCategoryRequest): CategoryResponse {
        // 중복 이름 체크
        val existing = categoryRepository.findByName(request.name)
        if (existing != null) {
            throw IllegalArgumentException("이미 존재하는 카테고리명입니다: ${request.name}")
        }

        val category = Category(
            name = request.name,
            displayName = request.displayName,
            displayOrder = request.displayOrder
        )
        val saved = categoryRepository.save(category)
        return CategoryResponse.from(saved)
    }

    fun updateCategory(id: Long, request: UpdateCategoryRequest): CategoryResponse {
        val category = categoryRepository.findById(id)
            .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: $id") }

        if (category.isDeleted) {
            throw IllegalArgumentException("삭제된 카테고리는 수정할 수 없습니다: $id")
        }

        // 이름 변경 시 중복 체크
        if (category.name != request.name) {
            val existing = categoryRepository.findByNameExcludingId(request.name, id)
            if (existing != null) {
                throw IllegalArgumentException("이미 존재하는 카테고리명입니다: ${request.name}")
            }
        }

        category.name = request.name
        category.displayName = request.displayName
        category.displayOrder = request.displayOrder
        category.updatedAt = java.time.LocalDateTime.now()

        val updated = categoryRepository.save(category)
        return CategoryResponse.from(updated)
    }

    fun deleteCategory(id: Long) {
        val category = categoryRepository.findById(id)
            .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: $id") }

        category.softDelete()
        categoryRepository.save(category)
    }
}

