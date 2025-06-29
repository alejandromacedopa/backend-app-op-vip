import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AddressModule } from './address/address.module';
import { MercadoPagoModule } from './mercado_pago/mercado_pago.module';
import { OrdersModule } from './orders/orders.module';
import { StockModule } from './stock/stock.module';
import { DiscountsModule } from './discounts/discounts.module';
import { CarouselModule } from './carousel/carousel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 🔑 Habilita process.env globalmente
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    AddressModule,
    MercadoPagoModule,
    OrdersModule,
    StockModule,
    DiscountsModule,
    CarouselModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
