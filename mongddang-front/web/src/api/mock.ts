import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Cute Keychain',
    description: 'Adorable acrylic keychain.',
    detailDescription: null,
    price: 5900,
    imageUrl: 'https://picsum.photos/seed/keychain/400/300',
    categoryId: 1,
    categoryName: 'accessory',
    categoryDisplayName: '액세서리',
    stock: 20,
  },
  {
    id: 'p2',
    name: 'Sticker Pack',
    description: 'Set of 10 vinyl stickers.',
    detailDescription: null,
    price: 3900,
    imageUrl: 'https://picsum.photos/seed/sticker/400/300',
    categoryId: 2,
    categoryName: 'stationery',
    categoryDisplayName: '문구',
    stock: 50,
  },
];


