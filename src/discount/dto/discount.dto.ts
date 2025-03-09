import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CampaignCategory } from '../enums/campaign-category.enum';
import { CartDto } from './cart.dto';

export class DiscountCampaignDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CampaignCategory)
  category: CampaignCategory;

  @IsString()
  @IsNotEmpty()
  type: string;

  parameters: Record<string, any>;
}

export class ApplyDiscountDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountCampaignDto)
  campaigns: DiscountCampaignDto[];
}

export class DiscountRequestDto {
  @ValidateNested()
  @Type(() => CartDto)
  @IsObject()
  cart: CartDto;

  @ValidateNested()
  @Type(() => ApplyDiscountDto)
  @IsObject()
  discounts: ApplyDiscountDto;
}
