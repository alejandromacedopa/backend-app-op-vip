import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  price: number;

  @IsNotEmpty()
  @IsString()
  id_category: number;

  @IsNotEmpty()
  @IsString()
  image: string;
}
