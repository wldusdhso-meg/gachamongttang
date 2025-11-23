# 백엔드 상품 관리 API 구현 계획

## 📋 개요

`mongddang-api` 모듈에 InnoDB 데이터베이스를 구성하고, 상품 등록/수정/삭제/조회 API를 구현합니다.

**API 경로 구조:**
- **어드민용 API:** `/admin/v1/*` (모든 어드민 API는 `/admin` 하위)
- **일반 사용자용 API:** `/v1/*` (기존 경로 유지)

**상품 관리 API:** `/admin/v1/products`

## 🎯 목표

- H2 데이터베이스 구성 (개발용, 나중에 MySQL/MariaDB로 전환)
- 상품(Product) 엔티티 및 테이블 설계 (JPA 자동 생성)
- 상품 CRUD API 구현
- 이미지 업로드 API 구현
- 데이터 검증 및 에러 처리

## 🗄️ 데이터베이스 설계

### 데이터베이스 설정

**개발 환경:** H2 인메모리 데이터베이스 (내장)  
**프로덕션 환경:** MySQL/MariaDB InnoDB (나중에 설정)

**H2 설정:**
- 인메모리 모드 (애플리케이션 재시작 시 데이터 초기화)
- JPA `ddl-auto=update`로 엔티티 기반 자동 테이블 생성

### Product 테이블 스키마 (엔티티 기반 자동 생성)

JPA 엔티티를 구현하면 자동으로 다음 구조의 테이블이 생성됩니다:

**예상 테이블 구조:**
- `id`: BIGINT (자동 증가, Primary Key)
- `name`: VARCHAR(255) (NOT NULL)
- `description`: TEXT
- `price`: DECIMAL(10, 2) (NOT NULL)
- `image_url`: VARCHAR(500)
- `category`: VARCHAR(50) (NOT NULL)
- `stock`: INT (NOT NULL, 기본값 0)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP (소프트 삭제용)

**필드 설명:**
- `id`: 상품 고유 ID (자동 증가)
- `name`: 상품명
- `description`: 상품 설명
- `price`: 가격 (소수점 2자리)
- `image_url`: 이미지 URL
- `category`: 카테고리 (예: 'accessory', 'stationery')
- `stock`: 재고 수량
- `created_at`: 등록일시
- `updated_at`: 수정일시
- `deleted_at`: 삭제일시 (소프트 삭제용)

## 📁 프로젝트 구조

```
mongddang-api/src/main/
├── kotlin/com/meg/gachamongddang/server/
│   ├── ServerApplication.kt
│   ├── config/
│   │   ├── WebConfig.kt
│   │   ├── DatabaseConfig.kt          # 데이터베이스 설정 (신규)
│   │   └── JpaConfig.kt              # JPA 설정 (신규)
│   ├── domain/
│   │   └── product/
│   │       ├── Product.kt            # 엔티티 (신규)
│   │       └── ProductCategory.kt   # 카테고리 enum (신규)
│   ├── repository/
│   │   └── product/
│   │       └── ProductRepository.kt # 리포지토리 (신규)
│   ├── service/
│   │   └── product/
│   │       └── ProductService.kt     # 서비스 (신규)
│   ├── controller/
│   │   ├── product/
│   │   │   └── ProductController.kt # 어드민용 컨트롤러 (/admin/v1/products) (신규)
│   │   └── api/
│   │       └── ProductApiController.kt # 일반 사용자용 컨트롤러 (/v1/products) (선택사항)
│   └── dto/
│       └── product/
│           ├── ProductRequest.kt    # 요청 DTO (신규)
│           ├── ProductResponse.kt    # 응답 DTO (신규)
│           └── ProductListResponse.kt # 목록 응답 DTO (신규)
└── resources/
    ├── application.properties        # 데이터베이스 설정 추가
    └── db/
        └── migration/
            └── (마이그레이션 파일 없음 - JPA 자동 생성 사용)
```

**API 경로 구조:**
- **어드민용:** `/admin/v1/products` (CRUD 모두)
- **일반 사용자용:** `/v1/products` (조회만, 선택사항)

## 🔧 구현 단계

### Phase 1: 데이터베이스 설정

#### 1.1 의존성 추가 (`mongddang-api/build.gradle.kts`)

```kotlin
dependencies {
    // 기존 의존성...
    
    // H2 데이터베이스 (개발용)
    runtimeOnly("com.h2database:h2")
    
    // MySQL/MariaDB 드라이버 (프로덕션용, 나중에 추가)
    // runtimeOnly("com.mysql:mysql-connector-j")
}
```

**참고:** Flyway는 제거되었습니다. JPA의 `ddl-auto=update`로 테이블을 자동 생성/수정합니다.

#### 1.2 데이터베이스 설정 (`application.properties`)

```properties
# 데이터소스 자동 구성 활성화
# spring.autoconfigure.exclude 제거 (JPA 사용을 위해)

# H2 데이터베이스 설정 (개발용)
# 인메모리 모드 (애플리케이션 재시작 시 데이터 초기화)
spring.datasource.url=jdbc:h2:mem:gachamongddang
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 콘솔 활성화 (개발용, http://localhost:8080/h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA 설정
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# 프로덕션용 MySQL 설정 (나중에 활성화)
# spring.datasource.url=jdbc:mysql://localhost:3306/gachamongddang?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=utf8mb4
# spring.datasource.username=your_username
# spring.datasource.password=your_password
# spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

#### 1.3 테이블 자동 생성

JPA의 `ddl-auto=update` 설정으로 엔티티를 기반으로 테이블이 자동 생성됩니다.

**Product 엔티티를 구현하면 자동으로 테이블이 생성됩니다.**

**참고:** 
- 개발 환경: `ddl-auto=update` (엔티티 변경 시 자동 반영)
- 프로덕션 환경: `ddl-auto=validate` (엔티티와 스키마 일치 여부만 확인)

### Phase 2: 도메인 모델 구현

#### 2.1 Product 엔티티 (`domain/product/Product.kt`)

```kotlin
package com.meg.gachamongddang.server.domain.product

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
    
    @Column(nullable = false, precision = 10, scale = 2)
    var price: BigDecimal,
    
    @Column(name = "image_url", length = 500)
    var imageUrl: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    var category: ProductCategory,
    
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
```

#### 2.2 ProductCategory enum (`domain/product/ProductCategory.kt`)

```kotlin
package com.meg.gachamongddang.server.domain.product

enum class ProductCategory(val displayName: String) {
    ACCESSORY("액세서리"),
    STATIONERY("문구"),
    ETC("기타");
    
    companion object {
        fun fromString(value: String): ProductCategory? {
            return values().find { it.name.equals(value, ignoreCase = true) }
        }
    }
}
```

### Phase 3: 리포지토리 구현

#### 3.1 ProductRepository (`repository/product/ProductRepository.kt`)

```kotlin
package com.meg.gachamongddang.server.repository.product

import com.meg.gachamongddang.server.domain.product.Product
import com.meg.gachamongddang.server.domain.product.ProductCategory
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
    fun findByCategory(@Param("category") category: ProductCategory, pageable: Pageable): Page<Product>
    
    // 검색
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% AND p.deletedAt IS NULL")
    fun searchByName(@Param("keyword") keyword: String, pageable: Pageable): Page<Product>
    
    // 카테고리 + 검색
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.name LIKE %:keyword% AND p.deletedAt IS NULL")
    fun searchByCategoryAndName(
        @Param("category") category: ProductCategory,
        @Param("keyword") keyword: String,
        pageable: Pageable
    ): Page<Product>
}
```

### Phase 4: DTO 구현

#### 4.1 ProductRequest (`dto/product/ProductRequest.kt`)

```kotlin
package com.meg.gachamongddang.server.dto.product

import com.meg.gachamongddang.server.domain.product.ProductCategory
import jakarta.validation.constraints.*
import java.math.BigDecimal

data class CreateProductRequest(
    @field:NotBlank(message = "상품명은 필수입니다")
    @field:Size(max = 255, message = "상품명은 255자 이하여야 합니다")
    val name: String,
    
    val description: String? = null,
    
    @field:NotNull(message = "가격은 필수입니다")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다")
    val price: BigDecimal,
    
    val imageUrl: String? = null,
    
    @field:NotNull(message = "카테고리는 필수입니다")
    val category: ProductCategory,
    
    @field:NotNull(message = "재고는 필수입니다")
    @field:Min(value = 0, message = "재고는 0 이상이어야 합니다")
    val stock: Int = 0
)

typealias UpdateProductRequest = CreateProductRequest
```

#### 4.2 ProductResponse (`dto/product/ProductResponse.kt`)

```kotlin
package com.meg.gachamongddang.server.dto.product

import com.meg.gachamongddang.server.domain.product.Product
import com.meg.gachamongddang.server.domain.product.ProductCategory
import java.time.LocalDateTime

data class ProductResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val price: BigDecimal,
    val imageUrl: String?,
    val category: ProductCategory,
    val stock: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(product: Product): ProductResponse {
            return ProductResponse(
                id = product.id,
                name = product.name,
                description = product.description,
                price = product.price,
                imageUrl = product.imageUrl,
                category = product.category,
                stock = product.stock,
                createdAt = product.createdAt,
                updatedAt = product.updatedAt
            )
        }
    }
}
```

#### 4.3 ProductListResponse (`dto/product/ProductListResponse.kt`)

```kotlin
package com.meg.gachamongddang.server.dto.product

import org.springframework.data.domain.Page

data class ProductListResponse(
    val products: List<ProductResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int
) {
    companion object {
        fun from(page: Page<Product>): ProductListResponse {
            return ProductListResponse(
                products = page.content.map { ProductResponse.from(it) },
                totalElements = page.totalElements,
                totalPages = page.totalPages,
                currentPage = page.number,
                pageSize = page.size
            )
        }
    }
}
```

### Phase 5: 서비스 구현

#### 5.1 ProductService (`service/product/ProductService.kt`)

```kotlin
package com.meg.gachamongddang.server.service.product

import com.meg.gachamongddang.server.domain.product.Product
import com.meg.gachamongddang.server.domain.product.ProductCategory
import com.meg.gachamongddang.server.dto.product.*
import com.meg.gachamongddang.server.repository.product.ProductRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ProductService(
    private val productRepository: ProductRepository
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
        category: ProductCategory? = null,
        page: Int = 0,
        size: Int = 20
    ): ProductListResponse {
        val pageable: Pageable = PageRequest.of(page, size)
        val productPage = when {
            category != null && keyword != null -> {
                productRepository.searchByCategoryAndName(category, keyword, pageable)
            }
            category != null -> {
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
        val product = Product(
            name = request.name,
            description = request.description,
            price = request.price,
            imageUrl = request.imageUrl,
            category = request.category,
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
        
        product.name = request.name
        product.description = request.description
        product.price = request.price
        product.imageUrl = request.imageUrl
        product.category = request.category
        product.stock = request.stock
        product.updatedAt = java.time.LocalDateTime.now()
        
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
```

### Phase 6: 컨트롤러 구현

#### 6.1 ProductController (`controller/product/ProductController.kt`)

```kotlin
package com.meg.gachamongddang.server.controller.product

import com.meg.gachamongddang.server.domain.product.ProductCategory
import com.meg.gachamongddang.server.dto.product.*
import com.meg.gachamongddang.server.service.product.ProductService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

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
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ProductListResponse> {
        val productCategory = category?.let { ProductCategory.fromString(it) }
        val result = productService.searchProducts(
            keyword = search,
            category = productCategory,
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
```

### Phase 7: 이미지 업로드 (선택사항)

#### 7.1 파일 업로드 설정 (`application.properties`)

```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

#### 7.2 FileStorageService (`service/FileStorageService.kt`)

```kotlin
package com.meg.gachamongddang.server.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID

@Service
class FileStorageService(
    @Value("\${app.upload.dir:uploads}")
    private val uploadDir: String
) {
    private val uploadPath: Path = Paths.get(uploadDir)
    
    init {
        Files.createDirectories(uploadPath)
    }
    
    fun storeFile(file: MultipartFile): String {
        val fileName = "${UUID.randomUUID()}_${file.originalFilename}"
        val filePath = uploadPath.resolve(fileName)
        Files.copy(file.inputStream, filePath)
        return "/uploads/$fileName"
    }
}
```

#### 7.3 이미지 업로드 (ProductController에 추가)

이미지 업로드 엔드포인트는 `ProductController`에 추가됩니다:

```kotlin
@PostMapping("/upload")
fun uploadImage(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
    val imageUrl = fileStorageService.storeFile(file)
    return ResponseEntity.ok(mapOf("imageUrl" to imageUrl))
}
```

**전체 경로:** `POST /admin/v1/products/upload`

## ✅ 체크리스트

### Phase 1: 데이터베이스 설정
- [x] H2 의존성 추가 (완료)
- [x] `application.properties` H2 데이터베이스 설정 (완료)
- [x] JPA ddl-auto 설정 (완료)
- [ ] 데이터베이스 연결 테스트
- [ ] H2 콘솔 접속 확인 (http://localhost:8080/h2-console)
- [ ] Product 엔티티 구현 후 테이블 자동 생성 확인
- [ ] (나중에) MySQL/MariaDB로 전환 준비

### Phase 2: 도메인 모델
- [x] Product 엔티티 구현 (완료)
- [x] ProductCategory enum 구현 (완료)
- [ ] 엔티티 테스트

### Phase 3: 리포지토리
- [x] ProductRepository 인터페이스 구현 (완료)
- [x] 커스텀 쿼리 메서드 구현 (완료)
- [ ] 리포지토리 테스트

### Phase 4: DTO
- [x] CreateProductRequest 구현 (완료)
- [x] UpdateProductRequest 구현 (완료)
- [x] ProductResponse 구현 (완료)
- [x] ProductListResponse 구현 (완료)

### Phase 5: 서비스
- [x] ProductService 구현 (완료)
- [x] 비즈니스 로직 구현 (완료)
- [x] 트랜잭션 처리 (완료)
- [ ] 서비스 테스트

### Phase 6: 컨트롤러
- [x] ProductController 구현 (`/admin/v1/products`) (완료)
- [x] API 엔드포인트 구현 (완료)
- [x] 유효성 검사 (완료)
- [x] 에러 처리 (완료)
- [ ] API 테스트
- [x] 일반 사용자용 API와 경로 구분 확인 (완료 - `/admin/v1/products` 사용)

### Phase 7: 추가 기능
- [x] 이미지 업로드 구현 (완료)
- [x] 파일 저장소 설정 (완료)
- [x] 정적 리소스 서빙 설정 (완료)

## 🚀 예상 작업 시간

- Phase 1: 3-4시간
- Phase 2: 2-3시간
- Phase 3: 2-3시간
- Phase 4: 2-3시간
- Phase 5: 4-5시간
- Phase 6: 3-4시간
- Phase 7: 3-4시간

**총 예상 시간: 19-26시간**

## 📚 참고 자료

- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Jakarta Validation](https://jakarta.ee/specifications/bean-validation/)
- [MySQL InnoDB](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html)

