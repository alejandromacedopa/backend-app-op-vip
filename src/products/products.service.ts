import { Product } from './product.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product-dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { deleteFileByUrl, uploadFile } from 'src/firebase/cloud_storage';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productsRepository: Repository<Product>) {}

  findAll() {
    return this.productsRepository.find();
  }

  findByCategory(id_category: number) {
    return this.productsRepository.findBy({ id_category });
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Product>> {
    return paginate<Product>(this.productsRepository, options);
  }

  findByName(name: string) {
    return this.productsRepository.find({ where: { name: Like(`%${name}%`) } });
  }

  // ✅ Crear producto con imágenes
  async create(files: Array<Express.Multer.File>, product: CreateProductDto) {
    if (!files || files.length < 2) {
      throw new HttpException('Debes subir al menos 2 imágenes', HttpStatus.BAD_REQUEST);
    }

    if (files.length > 3) {
      throw new HttpException('Solo puedes subir hasta 3 imágenes', HttpStatus.BAD_REQUEST);
    }

    const newProduct = this.productsRepository.create(product);
    const savedProduct = await this.productsRepository.save(newProduct);

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], 'products');
      if (url) {
        if (i === 0) savedProduct.image1 = url;
        if (i === 1) savedProduct.image2 = url;
        if (i === 2) savedProduct.image3 = url;
      }
    }

    return this.productsRepository.save(savedProduct);
  }

  // ✅ Actualizar imágenes específicas
  async updateWithImages(files: Array<Express.Multer.File>, id: number, product: UpdateProductDto) {
    if (!files || files.length === 0) {
      throw new HttpException('Las imágenes son obligatorias', HttpStatus.BAD_REQUEST);
    }

    const productFound = await this.productsRepository.findOneBy({ id });
    if (!productFound) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    const imagesToUpdate = product.images_to_update; // Ej: [0, 1]
    if (!Array.isArray(imagesToUpdate)) {
      throw new HttpException(
        'Debes especificar qué imágenes deseas actualizar',
        HttpStatus.BAD_REQUEST
      );
    }

    for (let i = 0; i < files.length; i++) {
      const index = Number(imagesToUpdate[i]);
      if (![0, 1, 2].includes(index)) continue;

      const oldImageUrl =
        index === 0 ? productFound.image1 : index === 1 ? productFound.image2 : productFound.image3;
      if (oldImageUrl) await deleteFileByUrl(oldImageUrl);

      const url = await uploadFile(files[i], 'products');
      if (url) {
        if (index === 0) productFound.image1 = url;
        if (index === 1) productFound.image2 = url;
        if (index === 2) productFound.image3 = url;
      }
    }

    const updatedProduct = Object.assign(productFound, product);
    return this.productsRepository.save(updatedProduct);
  }

  // ✅ Actualizar producto sin imágenes
  async update(id: number, product: UpdateProductDto) {
    const productFound = await this.productsRepository.findOneBy({ id });
    if (!productFound) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    const updatedProduct = Object.assign(productFound, product);
    return this.productsRepository.save(updatedProduct);
  }

  // ✅ Eliminar producto y sus imágenes del storage
  async delete(id: number) {
    const productFound = await this.productsRepository.findOneBy({ id });
    if (!productFound) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    if (productFound.image1) await deleteFileByUrl(productFound.image1);
    if (productFound.image2) await deleteFileByUrl(productFound.image2);
    if (productFound.image3) await deleteFileByUrl(productFound.image3);

    return this.productsRepository.delete(id);
  }
}
