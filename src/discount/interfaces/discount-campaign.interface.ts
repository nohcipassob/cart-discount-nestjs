import { CampaignCategory } from '../enums/campaign-category.enum';

export type DiscountCampaign = {
  id: string;
  name: string;
  category: CampaignCategory;
  type: string;
  parameters: Record<string, any>;
};
