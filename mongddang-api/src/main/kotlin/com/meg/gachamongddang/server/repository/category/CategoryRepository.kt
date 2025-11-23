package com.meg.gachamongddang.server.repository.category

import com.meg.gachamongddang.server.domain.category.Category
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface CategoryRepository : JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.deletedAt IS NULL ORDER BY c.displayOrder ASC, c.id ASC")
    fun findAllActive(): List<Category>

    @Query("SELECT c FROM Category c WHERE c.name = :name AND c.deletedAt IS NULL")
    fun findByName(name: String): Category?

    @Query("SELECT c FROM Category c WHERE c.name = :name AND (c.deletedAt IS NULL OR c.id != :excludeId)")
    fun findByNameExcludingId(name: String, excludeId: Long): Category?
}

