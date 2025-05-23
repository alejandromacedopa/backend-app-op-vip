import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './stock.entity';
import { Repository } from 'typeorm';
import { CreateStockDto } from './dto/create-stock.dto';
import { StockResponseDto } from './dto/response-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(@InjectRepository(Stock) private stockRepo: Repository<Stock>) {}

  async create(createStockDto: CreateStockDto): Promise<StockResponseDto> {
    const newStock = this.stockRepo.create(createStockDto);
    const savedStock = await this.stockRepo.save(newStock);
    return this.toResponseDto(savedStock);
  }

  async updateQuantity(
    id_product: number,
    updateStockDto: UpdateStockDto
  ): Promise<StockResponseDto> {
    const stock = await this.stockRepo.findOneBy({ id_product });
    if (!stock) throw new NotFoundException('Stock no encontrado');

    const updatedStock = await this.stockRepo.save({
      ...stock,
      ...updateStockDto,
      updated_at: new Date(),
    });

    return this.toResponseDto(updatedStock);
  }

  async getStockByProduct(id_product: number): Promise<StockResponseDto> {
    const stock = await this.stockRepo.findOneBy({ id_product });
    if (!stock) throw new NotFoundException('Stock no encontrado');
    return this.toResponseDto(stock);
  }

  async deleteByProduct(id_product: number): Promise<void> {
    await this.stockRepo.delete({ id_product });
  }

  private toResponseDto(stock: Stock): StockResponseDto {
    return {
      id: stock.id,
      id_product: stock.id_product,
      quantity: stock.quantity,
      created_at: stock.created_at,
      updated_at: stock.updated_at,
    };
  }
}
