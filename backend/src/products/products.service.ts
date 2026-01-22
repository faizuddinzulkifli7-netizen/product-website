import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(includeInactive = false): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product');
    if (!includeInactive) {
      query.where('product.isActive = :isActive', { isActive: true });
    }
    return query.getMany();
  }

  async findVisible(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isVisible: true, isActive: true },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      specifications: createProductDto.specifications
        ? JSON.stringify(createProductDto.specifications)
        : null,
      warnings: createProductDto.warnings ? JSON.stringify(createProductDto.warnings) : null,
    });
    return this.productsRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const updateData: any = { ...updateProductDto };
    
    if (updateProductDto.specifications) {
      updateData.specifications = JSON.stringify(updateProductDto.specifications);
    }
    if (updateProductDto.warnings) {
      updateData.warnings = JSON.stringify(updateProductDto.warnings);
    }

    Object.assign(product, updateData);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stockLevel = Math.max(0, product.stockLevel - quantity);
    product.inStock = product.stockLevel > 0;
    return this.productsRepository.save(product);
  }
}

