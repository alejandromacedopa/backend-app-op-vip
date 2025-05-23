import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateStockDto {
  @IsInt()
  @IsNotEmpty()
  id_product: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
