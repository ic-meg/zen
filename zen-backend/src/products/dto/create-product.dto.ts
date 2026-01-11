import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPositive, Min, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string; // Tools, Bowls, Sets, Matcha

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image?: string;
}