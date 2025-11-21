import { createContext, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types';

type State = { items: CartItem[] };
type Action =
  | { type: 'add'; productId: string; quantity?: number }
  | { type: 'remove'; productId: string }
  | { type: 'set'; productId: string; quantity: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const quantity = action.quantity ?? 1;
      const exists = state.items.find((i) => i.productId === action.productId);
      if (exists) {
        return {
          items: state.items.map((i) => i.productId === action.productId ? { ...i, quantity: i.quantity + quantity } : i),
        };
      }
      return { items: [...state.items, { productId: action.productId, quantity }] };
    }
    case 'remove':
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case 'set':
      return { items: state.items.map((i) => i.productId === action.productId ? { ...i, quantity: action.quantity } : i) };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  const value = useMemo<CartContextValue>(() => ({
    items: state.items,
    addToCart: (productId, quantity) => dispatch({ type: 'add', productId, quantity }),
    removeFromCart: (productId) => dispatch({ type: 'remove', productId }),
    setQuantity: (productId, quantity) => dispatch({ type: 'set', productId, quantity }),
  }), [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}



