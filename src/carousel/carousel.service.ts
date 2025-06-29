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

  // Listar todos los elementos del carrusel ACTIVOS
  findAll(): Promise<Carousel[]> {
    return this.carouselRepository.find({
      where: { is_enabled: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Listar todos los elementos del carrousel activos y desactivados para el admin
  findAllAdmin(): Promise<Carousel[]> {
    return this.carouselRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  //LISTAR
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

  async updateUnified(
    id: number,
    dto: UpdateCarouselDto & { images_to_update?: number[]; images_to_delete?: number[] },
    files: Express.Multer.File[]
  ): Promise<Carousel> {
    const carousel = await this.carouselRepository.findOneBy({ id });
    if (!carousel) {
      throw new HttpException('Carrusel no encontrado', HttpStatus.NOT_FOUND);
    }

    if (Array.isArray(dto.images_to_delete)) {
      for (const index of dto.images_to_delete) {
        if (index < 0 || index > 4) continue;

        const key = `image${index + 1}` as keyof Carousel;
        const currentUrl = carousel[key] as string | null;
        if (currentUrl) {
          console.log(`🗑️ Eliminando imagen en índice ${index}: ${currentUrl}`);
          await deleteFileByUrl(currentUrl);
          (carousel as any)[key] = null;
        }
      }
    }

    if (files && files.length > 0 && dto.images_to_update) {
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

        const key = `image${index + 1}` as keyof Carousel;
        const currentUrl = carousel[key] as string | null;
        if (currentUrl) await deleteFileByUrl(currentUrl);

        const newUrl = await uploadFile(files[i], 'carousel');
        (carousel as any)[key] = newUrl;
      }
    }

    const restDto = { ...dto };
    delete restDto.images_to_update;
    delete restDto.images_to_delete;

    Object.assign(carousel, restDto);

    return this.carouselRepository.save(carousel);
  }

  //CAMBIAR ESTADO DEL CARROUSELL DESDE UN BOTON
  async toggleStatus(id: number, is_enabled: boolean): Promise<Carousel> {
    const carousel = await this.carouselRepository.findOneBy({ id });
    if (!carousel) {
      throw new HttpException('Carrusel no encontrado', HttpStatus.NOT_FOUND);
    }

    carousel.is_enabled = is_enabled;
    return await this.carouselRepository.save(carousel);
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
