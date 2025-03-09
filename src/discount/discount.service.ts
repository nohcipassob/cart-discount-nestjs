import { Injectable, BadRequestException } from '@nestjs/common';
import { CartItem } from './interfaces/cart-item.interface';
import { DiscountCampaign } from './interfaces/discount-campaign.interface';
import { CampaignCategory } from './enums/campaign-category.enum';
import { DiscountResult } from './interfaces/discount-result.interface';

@Injectable()
export class DiscountService {
  private readonly MAX_POINTS_DISCOUNT = 0.2; // 20% of total

  calculateDiscount(
    items: CartItem[],
    coupon: DiscountCampaign[],
    onTop: DiscountCampaign[],
    seasonal: DiscountCampaign[],
    customerPoints = 0,
  ): DiscountResult {
    if (!items.length) {
      throw new BadRequestException('No items in the cart');
    }

    const originalTotal = this.calculateTotal(items);
    let currentTotal = originalTotal;
    const discount: { id: string; campaign: string; amount: number }[] = [];
    const appliedCampaigns: string[] = [];

    // Apply coupon discounts
    if (coupon.length) {
      const couponDiscount = this.calculateCampaignDiscount(
        coupon[0],
        items,
        currentTotal,
        customerPoints,
      );
      currentTotal -= couponDiscount;
      discount.push({
        id: coupon[0].id,
        campaign: coupon[0].name,
        amount: couponDiscount,
      });
    }

    // Apply onTop discounts
    if (onTop.length) {
      const onTopDiscount = this.calculateCampaignDiscount(
        onTop[0],
        items,
        currentTotal,
        customerPoints,
      );
      currentTotal -= onTopDiscount;
      discount.push({
        id: onTop[0].id,
        campaign: onTop[0].name,
        amount: onTopDiscount,
      });
    }

    // Apply seasonal discounts
    if (seasonal.length) {
      const seasonalDiscount = this.calculateCampaignDiscount(
        seasonal[0],
        items,
        currentTotal,
        customerPoints,
      );
      currentTotal -= seasonalDiscount;
      discount.push({
        id: seasonal[0].id,
        campaign: seasonal[0].name,
        amount: seasonalDiscount,
      });
    }

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
    if (type === 'FixedAmount') {
      return Math.min(parameters.amount, total);
    } else if (type === 'PercentageDiscount') {
      return (total * parameters.percentage) / 100;
    }
    return 0;
  }

  private applyOnTopDiscount(
    campaign: DiscountCampaign,
    items: CartItem[],
    total: number,
    customerPoints: number,
  ): number {
    if (campaign.type === 'DiscountByPoints') {
      return this.applyPointsDiscount(total, customerPoints);
    } else if (campaign.type === 'PercentageDiscountByItemCategory') {
      return this.applyItemCategoryDiscount(campaign, items);
    }
    return 0;
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
