import { Test, TestingModule } from '@nestjs/testing';
import { DiscountService } from './discount.service';
import { CartItem } from './interfaces/cart-item.interface';
import { DiscountCampaign } from './interfaces/discount-campaign.interface';
import { CampaignCategory } from './enums/campaign-category.enum';
import { ItemCategory } from './enums/item-category.enum';
import { BadRequestException } from '@nestjs/common';
import { DiscountRequestDto } from './dto/discount.dto';

describe('DiscountService', () => {
  let service: DiscountService;

  const defaultItems: CartItem[] = [
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

  const couponCampaigns: DiscountCampaign[] = [
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
      service.calculateDiscount({
        cart: { items: [] },
        discounts: { coupon: [], onTop: [], seasonal: [] },
      });
    }).toThrow(BadRequestException);
  });

  describe('Coupon Discounts', () => {
    it('should apply fixed amount discount correctly', () => {
      const data: DiscountRequestDto = {
        cart: { items: defaultItems },
        discounts: {
          coupon: [couponCampaigns[0]], // Fixed Amount Discount
          onTop: [],
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(550);
      expect(result.discount[0].amount).toBe(50);
      expect(result.discount[0].id).toContain('fixed1');
    });

    it('should apply percentage discount correctly', () => {
      const data: DiscountRequestDto = {
        cart: { items: defaultItems },
        discounts: {
          coupon: [couponCampaigns[1]], // Percentage Discount
          onTop: [],
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(540);
      expect(result.discount[0].amount).toBe(60);
      expect(result.discount[0].id).toContain('percent1');
    });

    it('should cap fixed amount discount to total price', () => {
      const smallItems = [
        {
          id: '1',
          name: 'Small Item',
          price: 30,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const bigDiscount = [
        {
          id: 'bigDiscount',
          name: 'Large Fixed Discount',
          category: CampaignCategory.COUPON,
          type: 'FixedAmount',
          parameters: { amount: 100 },
        },
      ];

      const data: DiscountRequestDto = {
        cart: { items: smallItems },
        discounts: {
          coupon: bigDiscount,
          onTop: [],
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(30);
      expect(result.finalPrice).toBe(0);
      expect(result.discount[0].amount).toBe(30); // Should be capped at original total
    });
  });

  describe('OnTop Discounts', () => {
    it('should apply percentage discount by item category correctly', () => {
      const clothingItems: CartItem[] = [
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

      const categoryDiscount: DiscountCampaign[] = [
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

      const data: DiscountRequestDto = {
        cart: { items: clothingItems },
        discounts: {
          coupon: [],
          onTop: categoryDiscount,
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(2540);
      expect(result.finalPrice).toBe(2382.5);
      expect(result.discount[0].amount).toBe(157.5);
      expect(result.discount[0].id).toContain('catDiscount1');
    });

    it('should apply discount by points correctly with 20% cap', () => {
      const pointsDiscount: DiscountCampaign[] = [
        {
          id: 'points1',
          name: 'Points Discount',
          category: CampaignCategory.ON_TOP,
          type: 'DiscountByPoints',
          parameters: {},
        },
      ];

      const data: DiscountRequestDto = {
        cart: {
          items: defaultItems,
          customerPoints: 68,
        },
        discounts: {
          coupon: [],
          onTop: pointsDiscount,
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(532);
      expect(result.discount[0].amount).toBe(68);
      expect(result.discount[0].id).toContain('points1');
    });

    it('should cap points discount at 20% of total', () => {
      const pointsDiscount: DiscountCampaign[] = [
        {
          id: 'points1',
          name: 'Points Discount',
          category: CampaignCategory.ON_TOP,
          type: 'DiscountByPoints',
          parameters: {},
        },
      ];

      const data: DiscountRequestDto = {
        cart: {
          items: defaultItems,
          customerPoints: 200,
        },
        discounts: {
          coupon: [],
          onTop: pointsDiscount,
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(600);
      // 20% of 600 = 120 (max discount allowed)
      expect(result.finalPrice).toBe(480);
      expect(result.discount[0].amount).toBe(120);
      expect(result.discount[0].id).toContain('points1');
    });
  });

  describe('Seasonal Discounts', () => {
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

      const seasonalDiscount: DiscountCampaign[] = [
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

      const data: DiscountRequestDto = {
        cart: { items },
        discounts: {
          coupon: [],
          onTop: [],
          seasonal: seasonalDiscount,
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(830);
      // 830 / 300 = 2.77, floor = 2, so 2 * 40 = 80 discount
      expect(result.finalPrice).toBe(750);
      expect(result.discount[0].amount).toBe(80);
      expect(result.discount[0].id).toContain('special1');
    });
  });

  describe('Multiple Discount Types', () => {
    it('should apply all types of discounts in the correct order', () => {
      const items = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 350,
          category: ItemCategory.CLOTHING,
          quantity: 2,
        },
        {
          id: '2',
          name: 'Hat',
          price: 250,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const coupon: DiscountCampaign[] = [
        {
          id: 'percent1',
          name: 'Percentage Discount',
          category: CampaignCategory.COUPON,
          type: 'PercentageDiscount',
          parameters: { percentage: 10 },
        },
      ];

      const onTop: DiscountCampaign[] = [
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

      const seasonal: DiscountCampaign[] = [
        {
          id: 'special1',
          name: 'Every 300 THB Discount',
          category: CampaignCategory.SEASONAL,
          type: 'SpecialCampaigns',
          parameters: {
            everyXTHB: 300,
            discountYTHB: 30,
          },
        },
      ];

      const data: DiscountRequestDto = {
        cart: { items },
        discounts: {
          coupon,
          onTop,
          seasonal,
        },
      };

      const result = service.calculateDiscount(data);
      // Original total: (350 * 2) + 250 = 950
      expect(result.originalTotal).toBe(950);

      // Expected calculation flow:
      // 1. Coupon: 10% off 950 = 95 discount, remaining 855
      // 2. OnTop: 15% off clothing (700) = 105 discount, remaining 750
      // 3. Seasonal: 750 / 300 = 2.5, floor = 2, so 2 * 30 = 60 discount, final price 690

      expect(result.finalPrice).toBe(690);
      expect(result.discount.length).toBe(3);
      expect(result.discount[0].amount).toBe(95); // Coupon
      expect(result.discount[1].amount).toBe(105); // OnTop
      expect(result.discount[2].amount).toBe(60); // Seasonal

      expect(result.discount[0].id).toContain('percent1');
      expect(result.discount[1].id).toContain('catDiscount1');
      expect(result.discount[2].id).toContain('special1');
    });

    it('should apply points discount and other discounts together', () => {
      const coupon: DiscountCampaign[] = [
        {
          id: 'fixed1',
          name: 'Fixed Amount Discount',
          category: CampaignCategory.COUPON,
          type: 'FixedAmount',
          parameters: { amount: 50 },
        },
      ];

      const onTop: DiscountCampaign[] = [
        {
          id: 'points1',
          name: 'Points Discount',
          category: CampaignCategory.ON_TOP,
          type: 'DiscountByPoints',
          parameters: {},
        },
      ];

      const data: DiscountRequestDto = {
        cart: {
          items: defaultItems,
          customerPoints: 50,
        },
        discounts: {
          coupon,
          onTop,
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      // Original total: 600
      expect(result.originalTotal).toBe(600);

      // Expected calculation flow:
      // 1. Coupon: 50 fixed discount, remaining 550
      // 2. OnTop: 50 points used, remaining 500

      expect(result.finalPrice).toBe(500);
      expect(result.discount.length).toBe(2);
      expect(result.discount[0].amount).toBe(50); // Coupon
      expect(result.discount[1].amount).toBe(50); // Points

      expect(result.discount[0].id).toContain('fixed1');
      expect(result.discount[1].id).toContain('points1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle fractional discounts correctly', () => {
      const items = [
        {
          id: '1',
          name: 'T-Shirt',
          price: 333.33,
          category: ItemCategory.CLOTHING,
          quantity: 1,
        },
      ];

      const coupon: DiscountCampaign[] = [
        {
          id: 'percent1',
          name: 'Percentage Discount',
          category: CampaignCategory.COUPON,
          type: 'PercentageDiscount',
          parameters: { percentage: 10 },
        },
      ];

      const data: DiscountRequestDto = {
        cart: { items },
        discounts: {
          coupon,
          onTop: [],
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBeCloseTo(333.33);
      expect(result.finalPrice).toBeCloseTo(299.997); // 333.33 - 33.333
      expect(result.discount[0].amount).toBeCloseTo(33.333);
    });

    it('should return original price when no discounts apply', () => {
      const data: DiscountRequestDto = {
        cart: { items: defaultItems },
        discounts: {
          coupon: [],
          onTop: [],
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(600);
      expect(result.finalPrice).toBe(600);
      expect(result.discount.length).toBe(0);
    });

    it('should handle zero price items', () => {
      const items = [
        {
          id: '1',
          name: 'Free Item',
          price: 0,
          category: ItemCategory.ACCESSORIES,
          quantity: 1,
        },
      ];

      const coupon: DiscountCampaign[] = [
        {
          id: 'percent1',
          name: 'Percentage Discount',
          category: CampaignCategory.COUPON,
          type: 'PercentageDiscount',
          parameters: { percentage: 10 },
        },
      ];

      const data: DiscountRequestDto = {
        cart: { items },
        discounts: {
          coupon,
          onTop: [],
          seasonal: [],
        },
      };

      const result = service.calculateDiscount(data);
      expect(result.originalTotal).toBe(0);
      expect(result.finalPrice).toBe(0);
      expect(result.discount.length).toBe(1);
      expect(result.discount[0].amount).toBe(0);
    });
  });
});
