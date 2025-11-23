package com.meg.gachamongddang.server.repository.product

import com.meg.gachamongddang.server.domain.category.Category
import com.meg.gachamongddang.server.domain.product.Product
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ProductRepository : JpaRepository<Product, Long> {
    
    // 삭제되지 않은 상품만 조회
    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL")
    fun findAllActive(pageable: Pageable): Page<Product>
    
    // 카테고리별 조회
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.deletedAt IS NULL")
    fun findByCategory(@Param("category") category: Category, pageable: Pageable): Page<Product>
    
    // 검색
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% AND p.deletedAt IS NULL")
    fun searchByName(@Param("keyword") keyword: String, pageable: Pageable): Page<Product>
    
    // 카테고리 + 검색
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.name LIKE %:keyword% AND p.deletedAt IS NULL")
    fun searchByCategoryAndName(
        @Param("category") category: Category,
        @Param("keyword") keyword: String,
        pageable: Pageable
    ): Page<Product>
}

