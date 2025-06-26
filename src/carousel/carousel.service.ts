import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Carousel } from './carousel.entity';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { uploadFile, deleteFileByUrl } from 'src/firebase/cloud_storage';
import { UpdateCarouselDto } from './dto/update-carousel.dto';

@Injectable()
export class CarouselService {
  constructor(
    @InjectRepository(Carousel)
    private readonly carouselRepository: Repository<Carousel>
  ) {}

  // Listar todos los elementos del carrusel
  findAll(): Promise<Carousel[]> {
    return this.carouselRepository.find();
  }

  // Buscar por título
  findByTitle(title: string): Promise<Carousel[]> {
    return this.carouselRepository.find({
      where: { title: Like(`%${title}%`) },
    });
  }

  // Crear elemento de carrusel con imágenes (mínimo 1, máximo 5)
  async create(files: Express.Multer.File[], dto: CreateCarouselDto): Promise<Carousel> {
    if (!files || files.length < 1) {
      throw new HttpException('Debes subir al menos 1 imagen', HttpStatus.BAD_REQUEST);
    }
    if (files.length > 5) {
      throw new HttpException('Solo puedes subir hasta 5 imágenes', HttpStatus.BAD_REQUEST);
    }

    const newCarousel = this.carouselRepository.create(dto);
    const saved = await this.carouselRepository.save(newCarousel);

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], 'carousel');
      if (url) {
        if (i === 0) saved.image1 = url;
        if (i === 1) saved.image2 = url;
        if (i === 2) saved.image3 = url;
        if (i === 3) saved.image4 = url;
        if (i === 4) saved.image5 = url;
      }
    }

    return this.carouselRepository.save(saved);
  }

  async updateWithImages(
    files: Express.Multer.File[],
    id: number,
    dto: UpdateCarouselDto & { images_to_update: number[] }
  ): Promise<Carousel> {
    if (!files || files.length === 0) {
      throw new HttpException('Debes subir al menos una imagen', HttpStatus.BAD_REQUEST);
    }

    const carousel = await this.carouselRepository.findOneBy({ id });
    if (!carousel) {
      throw new HttpException('Carrusel no encontrado', HttpStatus.NOT_FOUND);
    }

    const indices = dto.images_to_update;
    if (!Array.isArray(indices) || indices.length !== files.length) {
      throw new HttpException(
        'Los índices de imágenes no coinciden con los archivos enviados',
        HttpStatus.BAD_REQUEST
      );
    }

    for (let i = 0; i < files.length; i++) {
      const index = indices[i];
      if (index < 0 || index > 4) continue;

      const currentUrl = carousel[`image${index + 1}`];
      if (currentUrl) await deleteFileByUrl(currentUrl);

      const newUrl = await uploadFile(files[i], 'carousel');
      carousel[`image${index + 1}`] = newUrl;
    }

    // Eliminar del DTO la propiedad temporal `images_to_update` antes de asignar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images_to_update, ...restDto } = dto;
    Object.assign(carousel, restDto);

    return this.carouselRepository.save(carousel);
  }

  async update(id: number, dto: UpdateCarouselDto): Promise<Carousel> {
    const carousel = await this.carouselRepository.findOneBy({ id });
    if (!carousel) {
      throw new HttpException('Carrusel no encontrado', HttpStatus.NOT_FOUND);
    }

    Object.assign(carousel, dto);
    return this.carouselRepository.save(carousel);
  }

  // Eliminar elemento del carrusel y sus imágenes
  async delete(id: number): Promise<void> {
    const carousel = await this.carouselRepository.findOneBy({ id });
    if (!carousel) {
      throw new HttpException('Carrusel no encontrado', HttpStatus.NOT_FOUND);
    }

    const images = [
      carousel.image1,
      carousel.image2,
      carousel.image3,
      carousel.image4,
      carousel.image5,
    ];
    for (const img of images) {
      if (img) await deleteFileByUrl(img);
    }

    await this.carouselRepository.delete(id);
  }
}
