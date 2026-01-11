import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerFirstName: string;

  @IsString()
  customerLastName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsString()
  addressStreet: string;

  @IsString()
  addressRegion: string;

  @IsOptional()
  @IsString()
  addressProvince?: string;

  @IsString()
  addressCity: string;

  @IsString()
  addressBarangay: string;

  @IsString()
  addressZipCode: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}