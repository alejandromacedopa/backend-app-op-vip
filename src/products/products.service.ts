import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Like, Repository } from 'typeorm';
import storage = require('../util/cloud_storage');
import async_foreach = require('../util/async_foreach');
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product-dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';


@Injectable()
export class ProductsService {
    constructor(@InjectRepository(Product) private productsRepository: Repository<Product>) {}

    //todos los productos
    findAll() {
        return this.productsRepository.find();
    }
    //buscar productos por categoria
    findByCategory(id_category: number) {
        return this.productsRepository.findBy({ id_category: id_category });
    }
    async paginate(options: IPaginationOptions): Promise<Pagination<Product>> {
        return paginate<Product>(this.productsRepository, options);
    }

    //buscar productos por nombre
    findByName(name: string) {
        return this.productsRepository.find({ where : { name: Like(`%${name}%`) }})
    }

    //crear productos
    async create(files: Array<Express.Multer.File>, product: CreateProductDto) {

        if (files.length === 0) {
            throw new HttpException("Las imagenes son obligatorias", HttpStatus.NOT_FOUND);
        }

        let uploadedFiles = 0; // CONTAR CUANTOS ARCHIVOS SE HAN SUBIDO A FIREBASE

        const newProduct = this.productsRepository.create(product);
        const savedProduct = await this.productsRepository.save(newProduct);        

        const startForEach = async () => {
            await async_foreach(files, async (file: Express.Multer.File) => {
                const url = await storage(file, file.originalname);

                if (url !== undefined && url !== null) {
                    if (uploadedFiles === 0) {
                        savedProduct.image1 = url
                    }
                    else if (uploadedFiles === 1) {
                        savedProduct.image2 = url
                    }
                }

                await this.update(savedProduct.id, savedProduct);
                uploadedFiles = uploadedFiles + 1;
                
            })
        }
        await startForEach();
        return savedProduct;
        
    }
    
    //actualizar productos
    async updateWithImages(files: Array<Express.Multer.File>, id: number, product: UpdateProductDto) {

        if (files.length === 0) {
            throw new HttpException("Las imagenes son obligatorias", HttpStatus.NOT_FOUND);
        }

        let counter = 0;
        let uploadedFiles = Number(product.images_to_update[counter]); // CONTAR CUANTOS ARCHIVOS SE HAN SUBIDO A FIREBASE

        const updatedProduct = await this.update(id, product);     

        const startForEach = async () => {
            await async_foreach(files, async (file: Express.Multer.File) => {
                const url = await storage(file, file.originalname);

                if (url !== undefined && url !== null) {
                    if (uploadedFiles === 0) {
                        updatedProduct.image1 = url
                    }
                    else if (uploadedFiles === 1) {
                        updatedProduct.image2 = url
                    }
                }

                await this.update(updatedProduct.id, updatedProduct);
                counter++;
                uploadedFiles = Number(product.images_to_update[counter]);
                
            })
        }
        await startForEach();
        return updatedProduct;
        
    }

    async update(id: number, product: UpdateProductDto)  {   
 
             
        const productFound = await this.productsRepository.findOneBy({ id: id });
        console.log('Product found: ', productFound);
        
        if (!productFound) {
            throw new HttpException("Producto no encontrado", HttpStatus.NOT_FOUND);
        }
        const updatedProduct = Object.assign(productFound, product);
        console.log('Product Updated:', updatedProduct);

        return this.productsRepository.save(updatedProduct);
    }
    
    async delete(id: number)  {
        const productFound = await this.productsRepository.findOneBy({ id: id });
        if (!productFound) {
            throw new HttpException("Producto no encontrado", HttpStatus.NOT_FOUND);
        }
        return this.productsRepository.delete(id);
    }





}
