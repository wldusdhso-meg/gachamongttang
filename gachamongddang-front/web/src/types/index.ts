export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
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


