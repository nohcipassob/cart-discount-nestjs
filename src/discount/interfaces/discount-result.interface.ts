export type DiscountResult = {
  originalTotal: number;
  finalPrice: number;
  discount: {
    id: string;
    campaign: string;
    amount: number;
  }[];
};
