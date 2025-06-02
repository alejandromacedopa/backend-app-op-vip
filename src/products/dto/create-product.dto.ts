import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  id_category: number;
}
