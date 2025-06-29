import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
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
  @Get('admin')
  findAllAdmin() {
    return this.carouselService.findAllAdmin();
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

  @Put(':id')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files[]', 5))
  async updateUnified(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any
  ) {
    const dto: UpdateCarouselDto & {
      images_to_update?: number[];
      images_to_delete?: number[];
    } = {
      ...body,
      images_to_update: body.images_to_update ? JSON.parse(body.images_to_update) : [],
      images_to_delete: body.images_to_delete ? JSON.parse(body.images_to_delete) : [],
    };

    const hasFiles = files && files.length > 0;
    const hasDeletions = Array.isArray(dto.images_to_delete) && dto.images_to_delete.length > 0;

    if (!hasFiles && !hasDeletions) {
      throw new HttpException(
        'Debes subir al menos una imagen o indicar al menos una imagen a eliminar',
        HttpStatus.BAD_REQUEST
      );
    }

    if (hasFiles) {
      for (const file of files) {
        if (!file.mimetype.match(/image\/(png|jpeg|jpg)/)) {
          throw new HttpException('Tipo de archivo no permitido', HttpStatus.BAD_REQUEST);
        }
        if (file.size > 1024 * 1024 * 5) {
          throw new HttpException(
            'El archivo excede el tamaño permitido (5MB)',
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    return this.carouselService.updateUnified(id, dto, files);
  }

  // ENDPOINT PARA CAMBIAR EL ESTADO DEL CARRUSEL:
  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Put('status/:id')
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Body('is_enabled') is_enabled: boolean) {
    return this.carouselService.toggleStatus(id, is_enabled);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.carouselService.delete(id);
  }
}
