import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsArray, 
  ValidateNested, 
  IsNumber, 
  IsEnum,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerInfoDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;
}

class ShippingAddressDto {
  @IsString()
  street: string;

  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  city: string;

  @IsString()
  barangay: string;

  @IsString()
  zipCode: string;
}

class CheckoutItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCheckoutSessionDto {
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  success_url?: string;

  @IsOptional()
  @IsString()
  cancel_url?: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  shipping?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsEnum(['COD', 'paymongo'])
  paymentMethod: 'COD' | 'paymongo';
}