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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private CategoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.CategoriesService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.CategoriesService.findById(id);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createWithImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body() category: CreateCategoriesDto
  ) {
    return this.CategoriesService.create(file, category);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() category: UpdateCategoriesDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      const maxSize = 1024 * 1024 * 10; // 10MB
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (file.size > maxSize) {
        throw new BadRequestException('El archivo es demasiado grande, máximo 10MB');
      }
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Tipo de archivo no permitido');
      }

      return this.CategoriesService.updateWithImage(file, id, category);
    } else {
      return this.CategoriesService.update(id, category);
    }
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.CategoriesService.delete(id);
  }
}
