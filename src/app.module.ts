import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { DiscountModule } from './discount/discount.module';
import { CartController } from './cart/cart.controller';

@Module({
  imports: [ProductsModule, DiscountModule],
  controllers: [AppController, CartController],
  providers: [AppService],
})
export class AppModule {}
