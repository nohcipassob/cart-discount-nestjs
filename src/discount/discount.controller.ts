import { Body, Controller, Post } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountRequestDto } from './dto/discount.dto';
import { DiscountResult } from './interfaces/discount-result.interface';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('calculate')
  calculateDiscount(@Body() data: DiscountRequestDto): DiscountResult {
    const { cart, discounts } = data;
    const { coupon, onTop, seasonal } = discounts;

    return this.discountService.calculateDiscount(
      cart.items,
      coupon || [],
      onTop || [],
      seasonal || [],
      cart.customerPoints || 0,
    );
  }
}
