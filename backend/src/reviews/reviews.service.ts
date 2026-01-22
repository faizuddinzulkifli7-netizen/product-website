import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(productId?: string): Promise<Review[]> {
    const query = this.reviewsRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.status = :status', { status: ReviewStatus.APPROVED });

    if (productId) {
      query.andWhere('review.productId = :productId', { productId });
    }

    return query.getMany();
  }

  async findAllForAdmin(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async create(createReviewDto: CreateReviewDto, userId?: string): Promise<Review> {
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      userId,
      status: ReviewStatus.PENDING,
    });

    return this.reviewsRepository.save(review);
  }

  async updateStatus(id: string, updateReviewStatusDto: UpdateReviewStatusDto): Promise<Review> {
    const review = await this.findOne(id);
    review.status = updateReviewStatusDto.status;
    return this.reviewsRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }
}

