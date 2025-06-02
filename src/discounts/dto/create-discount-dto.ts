import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slogan?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsNumber()
  productId: number;
}
