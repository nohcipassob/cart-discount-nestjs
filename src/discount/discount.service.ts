import { Injectable, BadRequestException } from '@nestjs/common';
import { CartItem } from './interfaces/cart-item.interface';
import { DiscountCampaign } from './interfaces/discount-campaign.interface';
import { CampaignCategory } from './enums/campaign-category.enum';
import { DiscountResult } from './interfaces/discount-result.interface';
import { DiscountRequestDto } from './dto/discount.dto';

@Injectable()
export class DiscountService {
  private readonly MAX_POINTS_DISCOUNT = 0.2; // 20% of total

  calculateDiscount(data: DiscountRequestDto): DiscountResult {
    const { cart, discounts } = data;
    const { coupon = [], onTop = [], seasonal = [] } = discounts;
    const customerPoints = cart.customerPoints || 0;
    const items = cart.items;
  
    if (!items.length) {
      throw new BadRequestException('No items in the cart');
    }
  
    const originalTotal = this.calculateTotal(items);
    let currentTotal = originalTotal;
    const discount: { id: string; campaign: string; amount: number }[] = [];
  
    // Combine all the discount campaigns into a single array
    const allDiscounts = [...coupon, ...onTop, ...seasonal];
  
    // Apply all discount types in a single loop
    allDiscounts.forEach((campaign) => {
      const campaignDiscount = this.calculateCampaignDiscount(
        campaign,
        items,
        currentTotal,
        customerPoints,
      );
      if (campaignDiscount >= 0) {
        currentTotal -= campaignDiscount;
        discount.push({
          id: campaign.id,
          campaign: campaign.name,
          amount: campaignDiscount,
        });
      }
    });
  
    return {
      originalTotal,
      finalPrice: currentTotal,
      discount,
    };
  }
  

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private calculateCampaignDiscount(
    campaign: DiscountCampaign,
    items: CartItem[],
    total: number,
    customerPoints: number,
  ): number {
    switch (campaign.category) {
      case CampaignCategory.COUPON:
        return this.applyCouponDiscount(campaign, total);
      case CampaignCategory.ON_TOP:
        return this.applyOnTopDiscount(campaign, items, total, customerPoints);
      case CampaignCategory.SEASONAL:
        return this.applySpecialDiscount(campaign, total);
      default:
        return 0;
    }
  }

  private applyCouponDiscount(
    campaign: DiscountCampaign,
    total: number,
  ): number {
    const { type, parameters } = campaign;
    switch (type) {
      case 'FixedAmount':
        return Math.min(parameters.amount, total);
      case 'PercentageDiscount':
        return (total * parameters.percentage) / 100;
      default:
        return 0;
    }
  }

  private applyOnTopDiscount(
    campaign: DiscountCampaign,
    items: CartItem[],
    total: number,
    customerPoints: number,
  ): number {
    switch (campaign.type) {
      case 'DiscountByPoints':
        return this.applyPointsDiscount(total, customerPoints);
      case 'PercentageDiscountByItemCategory':
        return this.applyItemCategoryDiscount(campaign, items);
      default:
        return 0;
    }
  }

  private applyItemCategoryDiscount(
    campaign: DiscountCampaign,
    items: CartItem[],
  ): number {
    const { category, percentage } = campaign.parameters;
    const categoryTotal = items
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (categoryTotal * percentage) / 100;
  }

  private applyPointsDiscount(total: number, customerPoints: number): number {
    return Math.min(customerPoints, total * this.MAX_POINTS_DISCOUNT);
  }

  private applySpecialDiscount(
    campaign: DiscountCampaign,
    total: number,
  ): number {
    const { everyXTHB, discountYTHB } = campaign.parameters;
    return Math.floor(total / everyXTHB) * discountYTHB;
  }
}
