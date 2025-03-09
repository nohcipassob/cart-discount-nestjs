export type DiscountResult = {
  originalTotal: number;
  finalPrice: number;
  discountBreakdown: {
    campaign: string;
    amount: number;
  }[];
  appliedCampaigns: string[];
};
