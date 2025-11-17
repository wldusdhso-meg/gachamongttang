import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Cute Keychain',
    description: 'Adorable acrylic keychain.',
    price: 5900,
    imageUrl: 'https://picsum.photos/seed/keychain/400/300',
    category: 'accessory',
    stock: 20,
  },
  {
    id: 'p2',
    name: 'Sticker Pack',
    description: 'Set of 10 vinyl stickers.',
    price: 3900,
    imageUrl: 'https://picsum.photos/seed/sticker/400/300',
    category: 'stationery',
    stock: 50,
  },
];


