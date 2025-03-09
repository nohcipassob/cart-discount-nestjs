import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  Validate,
  ArrayMaxSize,
} from 'class-validator';
import { CampaignCategory } from '../enums/campaign-category.enum';
import { CartDto } from './cart.dto';
import { DiscountTypeParametersValidator } from '../validator/discount-type-parameters.validator';

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

  @IsObject()
  @IsNotEmpty()
  @Validate(DiscountTypeParametersValidator)
  parameters: Record<string, any>;
}

export class ApplyDiscountDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => DiscountCampaignDto)
  coupon?: DiscountCampaignDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => DiscountCampaignDto)
  onTop?: DiscountCampaignDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => DiscountCampaignDto)
  seasonal?: DiscountCampaignDto[];
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
