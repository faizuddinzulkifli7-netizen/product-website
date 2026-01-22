import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(@Query('productId') productId?: string) {
    const reviews = await this.reviewsService.findAll(productId);
    return reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0],
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
          }
        : null,
    }));
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAllForAdmin() {
    const reviews = await this.reviewsService.findAllForAdmin();
    return reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      date: review.createdAt.toISOString().split('T')[0],
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
          }
        : null,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const review = await this.reviewsService.findOne(id);
    return {
      id: review.id,
      productId: review.productId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0],
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
          }
        : null,
    };
  }

  @Post()
  async create(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
    const userId = req.user?.id;
    const review = await this.reviewsService.create(createReviewDto, userId);
    return {
      id: review.id,
      productId: review.productId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0],
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() updateReviewStatusDto: UpdateReviewStatusDto) {
    const review = await this.reviewsService.updateStatus(id, updateReviewStatusDto);
    return {
      id: review.id,
      status: review.status,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(id);
    return { message: 'Review deleted successfully' };
  }
}

