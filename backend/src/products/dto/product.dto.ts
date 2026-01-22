import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  shortDescription: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  image: string;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsNumber()
  @IsOptional()
  stockLevel?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsArray()
  @IsOptional()
  specifications?: string[];

  @IsString()
  @IsOptional()
  usage?: string;

  @IsString()
  @IsOptional()
  storage?: string;

  @IsArray()
  @IsOptional()
  warnings?: string[];
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsNumber()
  @IsOptional()
  stockLevel?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsArray()
  @IsOptional()
  specifications?: string[];

  @IsString()
  @IsOptional()
  usage?: string;

  @IsString()
  @IsOptional()
  storage?: string;

  @IsArray()
  @IsOptional()
  warnings?: string[];
}

