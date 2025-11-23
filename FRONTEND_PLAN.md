# 프론트엔드 상품 관리 기능 구현 계획

## 📋 개요

상품 관리 페이지를 `mongddang-front` 모듈에 구현하여 관리자가 상품을 등록/수정/삭제할 수 있도록 합니다.

**경로 구조:**
- 모든 어드민 페이지는 `/admin` 하위에 위치
- 예: `/admin/products` (상품 관리)

## 🎯 목표

- 상품 목록 조회 및 관리
- 상품 등록 (이미지 업로드 포함)
- 상품 수정
- 상품 삭제
- 상품 검색 및 필터링

## 📁 파일 구조

```
mongddang-front/web/src/
├── pages/
│   └── admin/
│       └── Products.tsx            # 상품 관리 페이지 (신규, /admin/products)
├── components/
│   ├── ProductForm.tsx              # 상품 등록/수정 폼 컴포넌트 (신규)
│   ├── ProductList.tsx              # 상품 목록 관리 컴포넌트 (신규)
│   └── ImageUpload.tsx              # 이미지 업로드 컴포넌트 (신규)
├── api/
│   ├── products.ts                  # 일반 사용자용 상품 API (/v1/products)
│   └── admin.ts                     # 어드민용 API 클라이언트 (/admin/v1/*) (신규)
└── types/
    └── index.ts                     # Product 타입 확장
```

## 🔧 구현 단계

### Phase 1: API 연동 준비

#### 1.1 API 함수 추가 (`src/api/products.ts`)

```typescript
// 기존 함수 (일반 사용자용 - /v1/products)
- fetchProducts(): Promise<Product[]>
- fetchProductById(id: string): Promise<Product | undefined>

// 추가할 함수 (어드민용 - /admin/v1/products)
- createProduct(product: CreateProductRequest): Promise<Product>
- updateProduct(id: string, product: UpdateProductRequest): Promise<Product>
- deleteProduct(id: string): Promise<void>
- uploadProductImage(file: File): Promise<{ imageUrl: string }>
```

**API 경로 구분:**
- 일반 사용자용: `/v1/products` (기존)
- 어드민용: `/admin/v1/products` (신규)

#### 1.2 어드민용 API 클라이언트 추가 (`src/api/admin.ts`)

어드민용 API는 별도 클라이언트 함수를 사용:

```typescript
// src/api/admin.ts (신규 파일)
const ADMIN_API_BASE_URL = '/admin/v1';

export async function adminApiFetch<T>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {},
): Promise<T> {
  const url = `${ADMIN_API_BASE_URL}${path}`;
  // ... apiFetch와 동일한 로직
}
```

#### 1.3 타입 확장 (`src/types/index.ts`)

```typescript
// 기존 타입
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
};

// 추가할 타입
export type CreateProductRequest = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;
```

### Phase 2: UI 컴포넌트 구현

#### 2.1 상품 관리 페이지 (`src/pages/admin/Products.tsx`)

**경로:** `/admin/products`

**기능:**
- 상품 목록 표시 (테이블 형태)
- 상품 등록 버튼
- 상품 수정/삭제 액션
- 검색 및 필터링

**UI 구성:**
```
┌─────────────────────────────────────────┐
│  상품 관리                               │
├─────────────────────────────────────────┤
│  [검색] [카테고리 필터] [등록하기]      │
├─────────────────────────────────────────┤
│  ID | 이름 | 가격 | 재고 | 카테고리 | 액션│
│  ─────────────────────────────────────  │
│  1  | ... | ... | ... | ... | [수정][삭제]│
└─────────────────────────────────────────┘
```

**상태 관리:**
- `products`: 상품 목록
- `selectedProduct`: 선택된 상품 (수정용)
- `isModalOpen`: 등록/수정 모달 열림 상태
- `searchQuery`: 검색어
- `categoryFilter`: 카테고리 필터

#### 2.2 상품 등록/수정 폼 (`src/components/ProductForm.tsx`)

**기능:**
- 상품 정보 입력 폼
- 이미지 업로드
- 유효성 검사
- 등록/수정 제출

**필드:**
- 상품명 (필수)
- 설명 (필수)
- 가격 (필수, 숫자)
- 재고 (필수, 숫자)
- 카테고리 (필수, 선택)
- 이미지 (필수, 파일 업로드)

**유효성 검사:**
- 모든 필수 필드 입력 확인
- 가격, 재고는 양수만 허용
- 이미지 파일 크기 제한 (예: 5MB)

#### 2.3 이미지 업로드 컴포넌트 (`src/components/ImageUpload.tsx`)

**기능:**
- 파일 선택
- 이미지 미리보기
- 업로드 진행 상태 표시
- 업로드된 이미지 URL 반환

**UI:**
- 드래그 앤 드롭 영역
- 파일 선택 버튼
- 미리보기 이미지
- 업로드 진행 바

#### 2.4 상품 목록 컴포넌트 (`src/components/ProductList.tsx`)

**기능:**
- 상품 목록 테이블 표시
- 페이지네이션
- 정렬 기능
- 수정/삭제 버튼

**컬럼:**
- 썸네일 이미지
- 상품명
- 가격
- 재고
- 카테고리
- 등록일
- 액션 (수정/삭제)

### Phase 3: 라우팅 및 권한 관리

#### 3.1 라우팅 설정 (`src/App.tsx`)

```typescript
// 어드민 라우팅
<Route path="/admin/products" element={<AdminProducts />} />
<Route path="/admin/*" element={<Navigate to="/admin/products" replace />} />

// 일반 사용자 라우팅 (기존)
<Route path="/" element={<Home />} />
<Route path="/products" element={<Products />} />
// ... 기타 라우트
```

**어드민 경로 구조:**
- 모든 어드민 페이지는 `/admin` 하위에 위치
- 예: `/admin/products` (상품 관리), `/admin/orders` (주문 관리), `/admin/users` (사용자 관리) 등
- 일반 사용자 경로와 명확히 구분

#### 3.2 권한 관리 (선택사항)

- 관리자 인증 체크
- 비인증 사용자 리다이렉트

### Phase 4: 에러 처리 및 사용자 경험

#### 4.1 에러 처리
- API 에러 메시지 표시
- 네트워크 에러 처리
- 유효성 검사 에러 표시

#### 4.2 로딩 상태
- 데이터 로딩 중 스켈레톤 UI
- 버튼 로딩 상태
- 이미지 업로드 진행 상태

#### 4.3 성공 피드백
- 등록/수정/삭제 성공 토스트 메시지
- 목록 자동 새로고침

## 🎨 UI/UX 가이드

### 디자인 원칙
- DaisyUI 컴포넌트 활용
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 접근성 고려 (키보드 네비게이션, ARIA 라벨)

### 주요 컴포넌트
- `table`: 상품 목록 표시
- `modal`: 등록/수정 폼
- `form`: 입력 폼
- `input`: 텍스트 입력
- `select`: 카테고리 선택
- `file-input`: 이미지 업로드
- `button`: 액션 버튼
- `toast`: 알림 메시지

## 📝 API 엔드포인트

### GET `/admin/v1/products`
- 상품 목록 조회
- 쿼리 파라미터: `page`, `size`, `category`, `search`

### GET `/admin/v1/products/:id`
- 상품 상세 조회

### POST `/admin/v1/products`
- 상품 등록
- Request Body: `CreateProductRequest`

### PUT `/admin/v1/products/:id`
- 상품 수정
- Request Body: `UpdateProductRequest`

### DELETE `/admin/v1/products/:id`
- 상품 삭제

### POST `/admin/v1/products/upload`
- 이미지 업로드
- Request: `multipart/form-data`
- Response: `{ imageUrl: string }`

## 🔄 상태 관리

### React Context (선택사항)
- 상품 목록 전역 상태 관리
- 캐싱 및 최적화

### 로컬 상태
- 폼 입력 상태
- 모달 열림/닫힘 상태
- 검색/필터 상태

## ✅ 체크리스트

### Phase 1: API 연동
- [x] 어드민용 API 클라이언트 추가 (`src/api/admin.ts`)
- [x] API 함수 추가 (`createProduct`, `updateProduct`, `deleteProduct`, `uploadProductImage`)
- [x] 타입 정의 추가 (`CreateProductRequest`, `UpdateProductRequest`, `ProductListResponse`)
- [x] API 클라이언트 설정 확인

### Phase 2: 컴포넌트 구현
- [x] `ProductForm` 컴포넌트 구현
- [x] `ImageUpload` 컴포넌트 구현
- [x] `ProductList` 컴포넌트 구현
- [x] `AdminProducts` 페이지 구현 (`src/pages/admin/Products.tsx`)

### Phase 3: 통합
- [x] 라우팅 설정 (`/admin/products`)
- [x] API 연동 (`/admin/v1/products`)
- [x] 에러 처리
- [x] 로딩 상태 처리
- [x] 일반 사용자 경로와 어드민 경로 구분 확인

### Phase 4: 최적화
- [x] 이미지 업로드 (드래그 앤 드롭 지원)
- [x] 페이지네이션
- [x] 검색/필터링 (카테고리 필터 포함)
- [x] 반응형 디자인 (DaisyUI 컴포넌트 활용)

## 🚀 예상 작업 시간

- Phase 1: 2-3시간
- Phase 2: 8-10시간
- Phase 3: 3-4시간
- Phase 4: 2-3시간

**총 예상 시간: 15-20시간**

## 📚 참고 자료

- [React Hook Form](https://react-hook-form.com/) - 폼 관리 (선택사항)
- [DaisyUI Components](https://daisyui.com/components/) - UI 컴포넌트
- [React Router](https://reactrouter.com/) - 라우팅
- [Axios](https://axios-http.com/) - HTTP 클라이언트

