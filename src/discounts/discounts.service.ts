import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Discount } from './discounts.entity';
import { Product } from 'src/products/product.entity';
import { CreateDiscountDto } from './dto/create-discount-dto';
import { UpdateDiscountDto } from './dto/update-discount-dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountRepo: Repository<Discount>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>
  ) {}

  async create(dto: CreateDiscountDto): Promise<Discount> {
    const product = await this.productRepo.findOneBy({ id: dto.productId });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Aplicar el descuento directamente al precio
    product.price = Number(product.price) - Number(dto.amount);
    await this.productRepo.save(product);

    const discount = this.discountRepo.create({ ...dto, product });
    return this.discountRepo.save(discount);
  }

  findAll(): Promise<Discount[]> {
    return this.discountRepo.find();
  }

  async findOne(id: number): Promise<Discount> {
    const discount = await this.discountRepo.findOneBy({ id });
    if (!discount) throw new NotFoundException('Descuento no encontrado');
    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.findOne(id);

    if (dto.productId) {
      const product = await this.productRepo.findOneBy({ id: dto.productId });
      if (!product) throw new NotFoundException('Producto no encontrado');
      discount.product = product;
    }

    Object.assign(discount, dto);
    return this.discountRepo.save(discount);
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id);
    await this.discountRepo.remove(discount);
  }

  async getDiscountedPrice(productId: number): Promise<number | null> {
    const now = new Date();
    const discount = await this.discountRepo.findOne({
      where: {
        product: { id: productId },
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { amount: 'DESC' }, // por si hay varios, toma el mayor
    });

    return discount ? discount.amount : null;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredDiscounts() {
    const now = new Date();

    const expiredDiscounts = await this.discountRepo.find({
      where: { endDate: LessThanOrEqual(now) },
      relations: ['product'],
    });

    for (const discount of expiredDiscounts) {
      const product = discount.product;

      // Revertir el precio original del producto
      product.price = Number(product.price) + Number(discount.amount);
      await this.productRepo.save(product);

      // Eliminar el descuento
      await this.discountRepo.remove(discount);
    }
  }
}
