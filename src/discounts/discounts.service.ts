import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Discount } from './discounts.entity';
import { Product } from 'src/products/product.entity';
import { CreateDiscountDto } from './dto/create-discount-dto';
import { UpdateDiscountDto } from './dto/update-discount-dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiscountStatus } from './status/discount-status';

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

    const now = new Date();
    const isActiveNow = now >= dto.startDate && now <= dto.endDate;

    const discount = this.discountRepo.create({
      ...dto,
      product,
      status: isActiveNow ? DiscountStatus.ACTIVE : DiscountStatus.PENDING,
      applied: false,
    });

    const saved = await this.discountRepo.save(discount);

    if (isActiveNow) {
      product.price = Number(product.price) - Number(discount.amount);
      saved.applied = true;
      await this.productRepo.save(product);
      await this.discountRepo.save(saved);
    }

    return saved;
  }

  findAll(): Promise<Discount[]> {
    return this.discountRepo.find();
  }

  async findOne(id: number): Promise<Discount> {
    const discount = await this.discountRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!discount) throw new NotFoundException('Descuento no encontrado');
    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.findOne(id);
    const now = new Date();

    const isActiveNow =
      now >= discount.startDate &&
      now <= discount.endDate &&
      discount.status === DiscountStatus.ACTIVE;

    // Si cambia de producto
    if (dto.productId && dto.productId !== discount.product.id) {
      if (discount.applied) {
        discount.product.price = Number(discount.product.price) + Number(discount.amount);
        await this.productRepo.save(discount.product);
        discount.applied = false;
      }

      const newProduct = await this.productRepo.findOneBy({ id: dto.productId });
      if (!newProduct) throw new NotFoundException('Producto no encontrado');
      discount.product = newProduct;

      if (isActiveNow) {
        newProduct.price = Number(newProduct.price) - Number(discount.amount);
        discount.applied = true;
        await this.productRepo.save(newProduct);
      }
    }

    // Actualizar campos del descuento
    Object.assign(discount, dto);

    return this.discountRepo.save(discount);
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id);

    if (discount.applied) {
      discount.product.price = Number(discount.product.price) + Number(discount.amount);
      await this.productRepo.save(discount.product);
    }

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
      order: { amount: 'DESC' },
    });

    return discount ? discount.amount : null;
  }

  // ⏱️ CRON para actualizar estados de descuentos automáticamente
  @Cron(CronExpression.EVERY_MINUTE)
  async handleDiscountStatusUpdate() {
    const now = new Date();

    const allDiscounts = await this.discountRepo.find({
      relations: ['product'],
    });

    for (const discount of allDiscounts) {
      const product = discount.product;

      if (now < discount.startDate) {
        if (discount.status !== DiscountStatus.PENDING) {
          discount.status = DiscountStatus.PENDING;
          discount.applied = false;
        }
      } else if (now >= discount.startDate && now <= discount.endDate) {
        if (discount.status !== DiscountStatus.ACTIVE) {
          discount.status = DiscountStatus.ACTIVE;
        }

        if (!discount.applied) {
          product.price = Number(product.price) - Number(discount.amount);
          discount.applied = true;
          await this.productRepo.save(product);
        }
      } else if (now > discount.endDate) {
        if (discount.status !== DiscountStatus.EXPIRED) {
          discount.status = DiscountStatus.EXPIRED;
        }

        if (discount.applied) {
          product.price = Number(product.price) + Number(discount.amount);
          discount.applied = false;
          await this.productRepo.save(product);
        }
      }

      await this.discountRepo.save(discount);
    }
  }
}
