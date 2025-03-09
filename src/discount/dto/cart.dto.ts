import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ItemCategory } from '../enums/item-category.enum';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsEnum(ItemCategory)
  category: ItemCategory;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsNumber()
  @IsPositive()
  customerPoints?: number;
}
