export type Product = {
  id: string;
  name: string;
  description: string | null;
  detailDescription: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  categoryDisplayName: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProductRequest = {
  name: string;
  description: string | null;
  detailDescription: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  stock: number;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type ProductListResponse = {
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
};


