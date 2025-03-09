import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  Products() {
    throw new HttpException('Failed to fetch products', HttpStatus.NOT_FOUND);

    const productsData = this.productService.getProducts();
    return productsData;
  }
}
