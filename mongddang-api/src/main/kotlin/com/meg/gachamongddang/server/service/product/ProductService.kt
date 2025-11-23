package com.meg.gachamongddang.server.service.product

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.domain.product.Product
import com.meg.gachamongddang.server.dto.product.*
import com.meg.gachamongddang.server.repository.category.CategoryRepository
import com.meg.gachamongddang.server.repository.product.ProductRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class ProductService(
    private val productRepository: ProductRepository,
    private val categoryRepository: CategoryRepository
) {
    
    fun getAllProducts(page: Int = 0, size: Int = 20): ProductListResponse {
        val pageable: Pageable = PageRequest.of(page, size)
        val productPage = productRepository.findAllActive(pageable)
        return ProductListResponse.from(productPage)
    }
    
    fun getProductById(id: Long): ProductResponse {
        val product = productRepository.findById(id)
            .orElseThrow { IllegalArgumentException("상품을 찾을 수 없습니다: $id") }
        
        if (product.isDeleted) {
            throw IllegalArgumentException("삭제된 상품입니다: $id")
        }
        
        return ProductResponse.from(product)
    }
    
    fun searchProducts(
        keyword: String? = null,
        categoryId: Long? = null,
        page: Int = 0,
        size: Int = 20
    ): ProductListResponse {
        val pageable: Pageable = PageRequest.of(page, size)
        val productPage = when {
            categoryId != null && keyword != null -> {
                val category = categoryRepository.findById(categoryId)
                    .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: $categoryId") }
                productRepository.searchByCategoryAndName(category, keyword, pageable)
            }
            categoryId != null -> {
                val category = categoryRepository.findById(categoryId)
                    .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: $categoryId") }
                productRepository.findByCategory(category, pageable)
            }
            keyword != null -> {
                productRepository.searchByName(keyword, pageable)
            }
            else -> {
                productRepository.findAllActive(pageable)
            }
        }
        return ProductListResponse.from(productPage)
    }
    
    fun createProduct(request: CreateProductRequest): ProductResponse {
        val category = categoryRepository.findById(request.categoryId)
            .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: ${request.categoryId}") }
        
        if (category.isDeleted) {
            throw IllegalArgumentException("삭제된 카테고리는 사용할 수 없습니다: ${request.categoryId}")
        }
        
        val product = Product(
            name = request.name,
            description = request.description,
            detailDescription = request.detailDescription,
            price = request.price,
            imageUrl = request.imageUrl,
            category = category,
            stock = request.stock
        )
        val saved = productRepository.save(product)
        return ProductResponse.from(saved)
    }
    
    fun updateProduct(id: Long, request: UpdateProductRequest): ProductResponse {
        val product = productRepository.findById(id)
            .orElseThrow { IllegalArgumentException("상품을 찾을 수 없습니다: $id") }
        
        if (product.isDeleted) {
            throw IllegalArgumentException("삭제된 상품은 수정할 수 없습니다: $id")
        }
        
        val category = categoryRepository.findById(request.categoryId)
            .orElseThrow { IllegalArgumentException("카테고리를 찾을 수 없습니다: ${request.categoryId}") }
        
        if (category.isDeleted) {
            throw IllegalArgumentException("삭제된 카테고리는 사용할 수 없습니다: ${request.categoryId}")
        }
        
        product.name = request.name
        product.description = request.description
        product.detailDescription = request.detailDescription
        product.price = request.price
        product.imageUrl = request.imageUrl
        product.category = category
        product.stock = request.stock
        product.updatedAt = LocalDateTime.now()
        
        val updated = productRepository.save(product)
        return ProductResponse.from(updated)
    }
    
    fun deleteProduct(id: Long) {
        val product = productRepository.findById(id)
            .orElseThrow { IllegalArgumentException("상품을 찾을 수 없습니다: $id") }
        
        product.softDelete()
        productRepository.save(product)
    }
}

