import { Injectable, BadRequestException } from '@nestjs/common';
import { CartItem } from './interfaces/cart-item.interface';
import { DiscountCampaign } from './interfaces/discount-campaign.interface';
import { CampaignCategory } from './enums/campaign-category.enum';
import { ItemCategory } from './enums/item-category.enum';
import { DiscountResult } from './interfaces/discount-result.interface';

@Injectable()
export class DiscountService {
  private readonly MAX_POINTS_DISCOUNT = 0.2; // 20% of total

  calculateDiscount(
    items: CartItem[],
    campaigns: DiscountCampaign[],
    customerPoints = 0,
  ): DiscountResult {
    if (!items.length) {
      throw new BadRequestException('No items in the cart');
    }

    const originalTotal = this.calculateTotal(items);
    let currentTotal = originalTotal;
    const discountBreakdown: { campaign: string; amount: number }[] = [];
    const appliedCampaigns: string[] = [];

    const groupedCampaigns = this.groupCampaignsByCategory(campaigns);

    const orderedCategories = [
      CampaignCategory.COUPON,
      CampaignCategory.ON_TOP,
      CampaignCategory.SEASONAL,
    ];

    for (const category of orderedCategories) {
      const categoryCampaigns = groupedCampaigns.get(category) || [];
      if (!categoryCampaigns.length) continue;

      const bestCampaign = this.findBestCampaign(
        categoryCampaigns,
        items,
        currentTotal,
        customerPoints,
      );

      if (bestCampaign) {
        const discount = this.calculateCampaignDiscount(
          bestCampaign,
          items,
          currentTotal,
          customerPoints,
        );
        currentTotal -= discount;

        discountBreakdown.push({
          campaign: bestCampaign.name,
          amount: discount,
        });
        appliedCampaigns.push(bestCampaign.id);
      }
    }

    return {
      originalTotal,
      finalPrice: currentTotal,
      discountBreakdown,
      appliedCampaigns,
    };
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private groupCampaignsByCategory(
    campaigns: DiscountCampaign[],
  ): Map<CampaignCategory, DiscountCampaign[]> {
    return campaigns.reduce((map, campaign) => {
      if (!map.has(campaign.category)) map.set(campaign.category, []);
      map.get(campaign.category)?.push(campaign);
      return map;
    }, new Map<CampaignCategory, DiscountCampaign[]>());
  }

  private findBestCampaign(
    campaigns: DiscountCampaign[],
    items: CartItem[],
    total: number,
    customerPoints: number,
  ): DiscountCampaign | null {
    return campaigns.reduce(
      (best, campaign) => {
        const discount = this.calculateCampaignDiscount(
          campaign,
          items,
          total,
          customerPoints,
        );
        return discount >
          (best
            ? this.calculateCampaignDiscount(best, items, total, customerPoints)
            : 0)
          ? campaign
          : best;
      },
      null as DiscountCampaign | null,
    );
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
