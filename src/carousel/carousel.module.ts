import { Module } from '@nestjs/common';
import { CarouselService } from './carousel.service';
import { CarouselController } from './carousel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carousel } from './carousel.entity';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Carousel])], // Add your Carousel entity here if you have one
  providers: [CarouselService, JwtStrategy],
  controllers: [CarouselController],
})
export class CarouselModule {}
