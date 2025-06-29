import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCarouselDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  image1?: string;

  @IsOptional()
  @IsString()
  image2?: string;

  @IsOptional()
  @IsString()
  image3?: string;

  @IsOptional()
  @IsString()
  image4?: string;

  @IsOptional()
  @IsString()
  image5?: string;

  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;
}
