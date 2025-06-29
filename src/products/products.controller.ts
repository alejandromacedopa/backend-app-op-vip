import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Product } from './product.entity';
import { API } from 'src/config/config';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get() // http:localhost:3000/products -> GET
  findAll() {
    return this.productsService.findAll();
  }

  @Get('pagination') // http:localhost:3000/categories -> GET
  async pagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number = 8
  ): Promise<Pagination<Product>> {
    return this.productsService.paginate({
      page,
      limit,
      route: `http://${API}:3000/products/pagination`,
    });
  }

  @Get('category/:id_category') // http:localhost:3000/categories -> GET
  findByCategory(@Param('id_category', ParseIntPipe) id_category: number) {
    return this.productsService.findByCategory(id_category);
  }

  @Get('search/:name') // http:localhost:3000/categories -> GET
  findByName(@Param('name') name: string) {
    return this.productsService.findByName(name);
  }

  @Get(':id') // http://localhost:3000/products/1
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Post() // http:localhost:3000/categories -> POST
  @UseInterceptors(FilesInterceptor('files[]', 4)) // Max 4 files
  create(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB por imagen
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      })
    )
    files: Array<Express.Multer.File>,
    @Body() product: CreateProductDto
  ) {
    console.log('Files: ', files);
    console.log('Product: ', product);

    return this.productsService.create(files, product);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files[]', 4))
  async update(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      })
    )
    files: Array<Express.Multer.File>,
    @Param('id', ParseIntPipe) id: number,
    @Body() rawBody: any // <-- importante: primero recibimos datos crudos
  ) {
    // 🔧 Transformamos los valores antes de pasar al servicio
    const transformedBody: UpdateProductDto = {
      ...rawBody,
      price: rawBody.price ? parseFloat(rawBody.price) : undefined,
      id_category: rawBody.id_category ? parseInt(rawBody.id_category, 10) : undefined,
      images_to_update: rawBody.images_to_update
        ? Array.isArray(rawBody.images_to_update)
          ? rawBody.images_to_update.map(Number)
          : [Number(rawBody.images_to_update)]
        : [],
    };

    return this.productsService.update(id, transformedBody, files);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Delete(':id') // http:localhost:3000/categories -> PUT
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
