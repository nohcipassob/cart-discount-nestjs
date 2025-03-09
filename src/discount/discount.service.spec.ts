import { Test, TestingModule } from '@nestjs/testing';
import { DiscountService } from './discount.service';
import { CartItem } from './interfaces/cart-item.interface';
import { DiscountCampaign } from './interfaces/discount-campaign.interface';
import { CampaignCategory } from './enums/campaign-category.enum';
import { ItemCategory } from './enums/item-category.enum';
import { BadRequestException } from '@nestjs/common';

describe('DiscountService', () => {
  let service: DiscountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountService],
    }).compile();

    service = module.get<DiscountService>(DiscountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error for empty cart', () => {
    expect(() => {
      service.calculateDiscount([], []);
    }).toThrow(BadRequestException);
  });

  describe('Coupon Discounts', () => {
    it('should apply fixed amount discount correctly', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'fixed1',
          name: 'Fixed Amount Discount',
          category: CampaignCategory.COUPON,
          type: 'FixedAmount',
          parameters: { amount: 50 },
        },
      ];

      const result = service.calculateDiscount(items, campaigns);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(550);
      expect(result.discountBreakdown[0].amount).toBe(50);
    });

    it('should apply percentage discount correctly', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'percent1',
          name: 'Percentage Discount',
          category: CampaignCategory.COUPON,
          type: 'PercentageDiscount',
          parameters: { percentage: 10 },
        },
      ];

      const result = service.calculateDiscount(items, campaigns);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(540);
      expect(result.discountBreakdown[0].amount).toBe(60);
    });

    it('should choose the better coupon discount', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'fixed1',
          name: 'Fixed Amount Discount',
          category: CampaignCategory.COUPON,
          type: 'FixedAmount',
          parameters: { amount: 50 },
        },
        {
          id: 'percent1',
          name: 'Percentage Discount',
          category: CampaignCategory.COUPON,
          type: 'PercentageDiscount',
          parameters: { percentage: 10 },
        },
      ];

      const result = service.calculateDiscount(items, campaigns);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(540);
      expect(result.discountBreakdown[0].amount).toBe(60);
      expect(result.appliedCampaigns).toContain('percent1');
      expect(result.appliedCampaigns).not.toContain('fixed1');
    });
  });

  describe('Category Discounts', () => {
    it('should apply percentage discount by item category correctly', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hoodie',
          price: 700,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '3',
          name: 'Watch',
          price: 850,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
        {
          id: '4',
          name: 'Bag',
          price: 640,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'catDiscount1',
          name: 'Clothing Discount',
          category: CampaignCategory.ON_TOP,
          type: 'PercentageDiscountByItemCategory',
          parameters: {
            category: ItemCategory.CLOTHING,
            percentage: 15,
          },
        },
      ];

      const result = service.calculateDiscount(items, campaigns);
      expect(result.originalTotal).toBe(2540);
      expect(result.finalPrice).toBe(2382.5);
      // 15% off clothing (350 + 700) = 15% of 1050 = 157.5
      expect(result.discountBreakdown[0].amount).toBe(157.5);
    });
  });

  describe('Points Discounts', () => {
    it('should apply discount by points correctly with 20% cap', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
        {
          id: '3',
          name: 'Belt',
          price: 230,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'points1',
          name: 'Points Discount',
          category: CampaignCategory.ON_TOP,
          type: 'DiscountByPoints',
          parameters: {},
        },
      ];

      // Total price is 830, 20% cap would be 166 THB, but user only has 68 points
      const result = service.calculateDiscount(items, campaigns, 68);
      expect(result.originalTotal).toBe(830);
      expect(result.finalPrice).toBe(762);
      expect(result.discountBreakdown[0].amount).toBe(68);
    });

    it('should apply capped discount by points correctly', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'points1',
          name: 'Points Discount',
          category: CampaignCategory.ON_TOP,
          type: 'DiscountByPoints',
          parameters: {},
        },
      ];

      // Total price is 600, 20% cap would be 120 THB, but user has 200 points
      const result = service.calculateDiscount(items, campaigns, 200);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(480);
      expect(result.discountBreakdown[0].amount).toBe(120); // Capped at 20%
    });
  });

  describe('Special Campaigns', () => {
    it('should apply special campaign discount correctly', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
        {
          id: '3',
          name: 'Belt',
          price: 230,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'special1',
          name: 'Every 300 THB Discount',
          category: CampaignCategory.SEASONAL,
          type: 'SpecialCampaigns',
          parameters: {
            everyXTHB: 300,
            discountYTHB: 40,
          },
        },
      ];

      // Total price is 830, with discount of 40 THB for every 300 THB
      // 830 / 300 = 2.76, so gets discount applied 2 times
      const result = service.calculateDiscount(items, campaigns);
      expect(result.originalTotal).toBe(830);
      expect(result.finalPrice).toBe(750);
      expect(result.discountBreakdown[0].amount).toBe(80); // 2 * 40 = 80
    });
  });

  describe('Multiple Discounts', () => {
    it('should apply discounts in the correct order', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '2',
          name: 'Hoodie',
          price: 700,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
        {
          id: '3',
          name: 'Watch',
          price: 850,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const campaigns: DiscountCampaign[] = [
        {
          id: 'percent1',
          name: 'Percentage Discount',
          category: CampaignCategory.COUPON,
          type: 'PercentageDiscount',
          parameters: { percentage: 10 },
        },
        {
          id: 'catDiscount1',
          name: 'Clothing Discount',
          category: CampaignCategory.ON_TOP,
          type: 'PercentageDiscountByItemCategory',
          parameters: {
            category: ItemCategory.CLOTHING,
            percentage: 15,
          },
        },
        {
          id: 'special1',
          name: 'Every 500 THB Discount',
          category: CampaignCategory.SEASONAL,
          type: 'SpecialCampaigns',
          parameters: {
            everyXTHB: 500,
            discountYTHB: 50,
          },
        },
      ];

      // Ordered applications:
      // 1. Coupon: 10% off 1900 = 190, new total = 1710
      // 2. OnTop: 15% off clothing (1050) = 157.5, new total = 1552.5
      // 3. Seasonal: 50 THB for every 500 THB = 150, new total = 1402.5
      const result = service.calculateDiscount(items, campaigns);
      expect(result.originalTotal).toBe(1900);
      expect(result.finalPrice).toBe(1402.5);
      expect(result.discountBreakdown.length).toBe(3);
      expect(result.appliedCampaigns.length).toBe(3);
    });
  });
});
