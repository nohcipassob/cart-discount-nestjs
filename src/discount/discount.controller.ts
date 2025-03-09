import { Body, Controller, Post } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountRequestDto } from './dto/discount.dto';
import { DiscountResult } from './interfaces/discount-result.interface';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('calculate')
  calculateDiscount(@Body() data: DiscountRequestDto): DiscountResult {
    return this.discountService.calculateDiscount(
      data.cart.items,
      data.discounts.campaigns,
      data.cart.customerPoints || 0,
    );
  }
}
