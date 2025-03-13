import { Test, TestingModule } from '@nestjs/testing';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { ItemCategory } from './enums/item-category.enum';
import { CampaignCategory } from './enums/campaign-category.enum';

describe('DiscountController', () => {
  let controller: DiscountController;
  let service: DiscountService;

  beforeEach(async () => {
    const mockDiscountService = {
      calculateDiscount: jest.fn().mockReturnValue({
        originalTotal: 600,
        finalPrice: 550,
        discountBreakdown: [
          {
            campaign: 'Fixed Amount Discount',
            amount: 50,
          },
        ],
        appliedCampaigns: ['fixed1'],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountController],
      providers: [
        {
          provide: DiscountService,
          useValue: mockDiscountService,
        },
      ],
    }).compile();

    controller = module.get<DiscountController>(DiscountController);
    service = module.get<DiscountService>(DiscountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should calculate discount correctly', () => {
    const mockRequest = {
      cart: {
        items: [
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
        ],
        customerPoints: 30,
      },
      discounts: {
        coupon: [
          {
            id: 'fixed1',
            name: 'Fixed Amount Discount',
            category: CampaignCategory.COUPON,
            type: 'FixedAmount',
            parameters: {
              amount: 50,
            },
          },
        ],
        onTop: [],
        seasonal: [],
      },
    };

    const expectedResult = {
      originalTotal: 600,
      finalPrice: 550,
      discountBreakdown: [
        {
          campaign: 'Fixed Amount Discount',
          amount: 50,
        },
      ],
      appliedCampaigns: ['fixed1'],
    };

    const result = controller.calculateDiscount(mockRequest);
    expect(result).toEqual(expectedResult);
    expect(service.calculateDiscount).toHaveBeenCalledWith(mockRequest);
  });
});
