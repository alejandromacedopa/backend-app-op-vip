import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from 'src/categories/categories.entity';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { DiscountsModule } from 'src/discounts/discounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), DiscountsModule],
  providers: [ProductsService, JwtStrategy],
  controllers: [ProductsController],
})
export class ProductsModule {}
