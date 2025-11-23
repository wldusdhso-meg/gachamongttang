package com.meg.gachamongddang.server.domain.product

import com.meg.gachamongddang.server.domain.category.Category
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "products")
class Product(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    var name: String,
    
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    
    @Column(name = "detail_description", columnDefinition = "TEXT")
    var detailDescription: String? = null,
    
    @Column(nullable = false, precision = 10, scale = 2)
    var price: BigDecimal,
    
    @Column(name = "image_url", length = 500)
    var imageUrl: String? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    var category: Category,
    
    @Column(nullable = false)
    var stock: Int = 0,
    
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "deleted_at")
    var deletedAt: LocalDateTime? = null
) {
    val isDeleted: Boolean
        get() = deletedAt != null
    
    fun softDelete() {
        deletedAt = LocalDateTime.now()
    }
    
    fun restore() {
        deletedAt = null
    }
}

