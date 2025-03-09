import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  getProducts() {
    // mock products data
    return [
      {
        id: 1,
        name: 'T-Shirt',
        category: 'Clothing',
        price: 350, // in THB
        quantity: 1,
      },
      {
        id: 2,
        name: 'Hat',
        category: 'Accessories',
        price: 250, // in THB
        quantity: 1,
      },
      {
        id: 3,
        name: 'Hoodie',
        category: 'Clothing',
        price: 700, // in THB
        quantity: 1,
      },
      {
        id: 4,
        name: 'Watch',
        category: 'Accessories',
        price: 850, // in THB
        quantity: 1,
      },
      {
        id: 5,
        name: 'Belt',
        category: 'Clothing',
        price: 230, // in THB
        quantity: 1,
      },
      {
        id: 6,
        name: 'Bag',
        category: 'Accessories',
        price: 640, // in THB
        quantity: 1,
      },
    ];
  }
}
