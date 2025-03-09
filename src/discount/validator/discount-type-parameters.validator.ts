import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DiscountCampaignDto } from '../dto/discount.dto';

// Validator for discount type parameters
@ValidatorConstraint({ name: 'discountTypeParameters', async: false })
export class DiscountTypeParametersValidator
  implements ValidatorConstraintInterface
{
  validate(parameters: Record<string, any>, args: ValidationArguments) {
    const discount = args.object as DiscountCampaignDto;

    switch (discount.type) {
      case 'PercentageDiscount':
        return (
          parameters &&
          typeof parameters.percentage === 'number' &&
          parameters.percentage > 0
        );

      case 'PercentageDiscountByItemCategory':
        return (
          parameters &&
          typeof parameters.percentage === 'number' &&
          parameters.percentage > 0 &&
          typeof parameters.category === 'string' &&
          parameters.category.length > 0
        );

      case 'SpecialCampaigns':
        return (
          parameters &&
          typeof parameters.everyXTHB === 'number' &&
          parameters.everyXTHB > 0 &&
          typeof parameters.discountYTHB === 'number' &&
          parameters.discountYTHB > 0
        );

      default:
        return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const discount = args.object as DiscountCampaignDto;

    switch (discount.type) {
      case 'PercentageDiscount':
        return 'Parameters must include a valid "percentage" property for PercentageDiscount type';

      case 'PercentageDiscountByItemCategory':
        return 'Parameters must include valid "percentage" and "category" properties for PercentageDiscountByItemCategory type';

      case 'SpecialCampaigns':
        return 'Parameters must include valid "everyXTHB" and "discountYTHB" properties for SpecialCampaigns type';

      default:
        return 'Invalid parameters for the specified discount type';
    }
  }
}
