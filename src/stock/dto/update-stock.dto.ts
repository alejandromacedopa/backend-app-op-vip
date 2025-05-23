import { IsInt, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  @IsOptional()
  id_product?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;
}
