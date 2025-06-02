import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './categories.entity';
import { Repository } from 'typeorm';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import * as storage from '../firebase/cloud_storage';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private categoriesRepository: Repository<Category>) {}

  // LIST
  findAll() {
    return this.categoriesRepository.find();
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new HttpException('La categoría no existe', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  // CREATE
  async create(file: Express.Multer.File, category: CreateCategoriesDto) {
    const url = await storage.uploadFile(file, 'categories');
    if (!url) {
      throw new HttpException('La imagen no se pudo guardar', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    category.image = url;
    const newCategory = this.categoriesRepository.create(category);
    return this.categoriesRepository.save(newCategory);
  }

  // UPDATE sin imagen
  async update(id: number, category: UpdateCategoriesDto) {
    const categoryFound = await this.categoriesRepository.findOneBy({ id });
    if (!categoryFound) {
      throw new HttpException('La categoria no existe', HttpStatus.NOT_FOUND);
    }
    categoryFound.updated_at = new Date();
    const updatedCategory = Object.assign(categoryFound, category);
    return this.categoriesRepository.save(updatedCategory);
  }

  // UPDATE con imagen
  async updateWithImage(file: Express.Multer.File, id: number, category: UpdateCategoriesDto) {
    const categoryFound = await this.categoriesRepository.findOneBy({ id });
    if (!categoryFound) {
      throw new HttpException('La categoria no existe', HttpStatus.NOT_FOUND);
    }

    // DELETE IMAGE IF EXISTS
    if (categoryFound.image) {
      await storage.deleteFileByUrl(categoryFound.image);
    }

    const url = await storage.uploadFile(file, 'categories');
    if (!url) {
      throw new HttpException('La imagen no se pudo guardar', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    categoryFound.updated_at = new Date();
    category.image = url;
    const updatedCategory = Object.assign(categoryFound, category);
    return this.categoriesRepository.save(updatedCategory);
  }

  // DELETE
  async delete(id: number) {
    const categoryFound = await this.categoriesRepository.findOneBy({ id });
    if (!categoryFound) {
      throw new HttpException('La categoria no existe', HttpStatus.NOT_FOUND);
    }

    // Eliminar imagen asociada si existe
    if (categoryFound.image) {
      await storage.deleteFileByUrl(categoryFound.image);
    }

    return this.categoriesRepository.delete(id);
  }
}
