import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CarouselService } from './carousel.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';

@Controller('carousel')
export class CarouselController {
  constructor(private carouselService: CarouselService) {}

  @Get()
  findAll() {
    return this.carouselService.findAll();
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files[]', 5)) // Máximo 5 imágenes
  create(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      })
    )
    files: Array<Express.Multer.File>,
    @Body() dto: CreateCarouselDto
  ) {
    return this.carouselService.create(files, dto);
  }

  @Put('upload/:id')
  @UseInterceptors(FilesInterceptor('files[]', 5))
  updateWithImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      })
    )
    files: Array<Express.Multer.File>,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarouselDto & { images_to_update: number[] }
  ) {
    return this.carouselService.updateWithImages(files, id, dto);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCarouselDto) {
    return this.carouselService.update(id, dto);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.carouselService.delete(id);
  }
}
