import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('stocks')
export class StockController {
  constructor(private stockService: StockService) {}

  @HasRoles(JwtRole.ADMIN, JwtRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Put(':id_product')
  update(
    @Param('id_product', ParseIntPipe) id_product: number,
    @Body() updateStockDto: UpdateStockDto
  ) {
    return this.stockService.updateQuantity(id_product, updateStockDto);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Get(':id_product')
  get(@Param('id_product', ParseIntPipe) id_product: number) {
    return this.stockService.getStockByProduct(id_product);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Delete(':id_product')
  delete(@Param('id_product', ParseIntPipe) id_product: number) {
    return this.stockService.deleteByProduct(id_product);
  }
}
