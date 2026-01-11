import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class AddItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}