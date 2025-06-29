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

  // LIST
  findAll() {
    return this.productsRepository.find({
      relations: ['category'], // ← Esto carga la relación
    });
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  // LIST FOR CATEGORY
  findByCategory(id_category: number) {
    return this.productsRepository.find({
      where: { id_category },
      relations: ['category'], // ← Esto carga la relación
    });
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Product>> {
    return paginate<Product>(this.productsRepository, options, {
      relations: ['category'], // ← Esto carga la relación
    });
  }

  findByName(name: string) {
    return this.productsRepository.find({
      where: { name: Like(`%${name}%`) },
      relations: ['category'], // ← Esto carga la relación
    });
  }
  // CREATE PRODUCTS WITH IMAGES
  async create(files: Array<Express.Multer.File>, product: CreateProductDto) {
    if (!files || files.length < 2) {
      throw new HttpException('Debes subir al menos 2 imágenes', HttpStatus.BAD_REQUEST);
    }
    if (files.length > 4) {
      throw new HttpException('Solo puedes subir hasta 4 imágenes', HttpStatus.BAD_REQUEST);
    }

    const newProduct = this.productsRepository.create(product);
    const savedProduct = await this.productsRepository.save(newProduct);

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], 'products');
      if (url) {
        if (i === 0) savedProduct.image1 = url;
        if (i === 1) savedProduct.image2 = url;
        if (i === 2) savedProduct.image3 = url;
        if (i === 3) savedProduct.image4 = url;
      }
    }

    return this.productsRepository.save(savedProduct);
  }
  async update(id: number, product: UpdateProductDto, files?: Array<Express.Multer.File>) {
    const productFound = await this.productsRepository.findOneBy({ id });
    if (!productFound) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    // Actualiza imágenes si se recibieron archivos y se especificó `images_to_update`
    if (files && files.length > 0) {
      const indices = product.images_to_update;

      if (!Array.isArray(indices)) {
        throw new HttpException(
          'Debes especificar qué imágenes actualizar',
          HttpStatus.BAD_REQUEST
        );
      }

      for (let i = 0; i < files.length; i++) {
        const index = Number(indices[i]);
        if (![0, 1, 2, 3].includes(index)) continue;

        const oldImageUrl =
          index === 0
            ? productFound.image1
            : index === 1
              ? productFound.image2
              : index === 2
                ? productFound.image3
                : productFound.image4;

        if (oldImageUrl) await deleteFileByUrl(oldImageUrl);

        const url = await uploadFile(files[i], 'products');
        if (url) {
          if (index === 0) productFound.image1 = url;
          if (index === 1) productFound.image2 = url;
          if (index === 2) productFound.image3 = url;
          if (index === 3) productFound.image4 = url;
        }
      }
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
    if (productFound.image4) await deleteFileByUrl(productFound.image4);

    return this.productsRepository.delete(id);
  }
}
