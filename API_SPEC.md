# 일반 사용자용 상품 API 스펙

## 개요
일반 사용자가 상품을 조회할 수 있는 공개 API입니다.

## Base URL
```
/v1/products
```

## 엔드포인트

### 1. 상품 목록 조회
**GET** `/v1/products`

#### 쿼리 파라미터
| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| `page` | number | 아니오 | 페이지 번호 (0부터 시작) | 0 |
| `size` | number | 아니오 | 페이지 크기 | 20 |
| `categoryId` | number | 아니오 | 카테고리 ID로 필터링 | - |
| `search` | string | 아니오 | 상품명으로 검색 | - |

#### 응답 예시
```json
{
  "products": [
    {
      "id": 1,
      "name": "액세서리 상품",
      "description": "설명",
      "price": 10000.00,
      "imageUrl": "/uploads/image.jpg",
      "categoryId": 1,
      "categoryName": "ACCESSORY",
      "categoryDisplayName": "액세서리",
      "stock": 10,
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0,
  "pageSize": 20
}
```

#### 상태 코드
- `200 OK`: 성공

---

### 2. 상품 상세 조회
**GET** `/v1/products/{id}`

#### Path 파라미터
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `id` | number | 예 | 상품 ID |

#### 응답 예시
```json
{
  "id": 1,
  "name": "액세서리 상품",
  "description": "설명",
  "price": 10000.00,
  "imageUrl": "/uploads/image.jpg",
  "categoryId": 1,
  "categoryName": "ACCESSORY",
  "categoryDisplayName": "액세서리",
  "stock": 10,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

#### 상태 코드
- `200 OK`: 성공
- `404 Not Found`: 상품을 찾을 수 없음

---

## 카테고리 목록 조회 (추가)
일반 사용자도 카테고리 목록을 조회할 수 있어야 필터링이 가능합니다.

### GET `/v1/categories`

#### 응답 예시
```json
[
  {
    "id": 1,
    "name": "ACCESSORY",
    "displayName": "액세서리",
    "displayOrder": 1,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
]
```

---

## 관리자 API와의 차이점
- **경로**: `/v1/products` (일반 사용자) vs `/admin/v1/products` (관리자)
- **권한**: 인증 불필요 (일반 사용자) vs 인증 필요 (관리자, 추후 구현)
- **기능**: 조회만 가능 (일반 사용자) vs CRUD 모두 가능 (관리자)

