import { ItemCategory } from '../enums/item-category.enum';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: ItemCategory;
  quantity: number;
};
