import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ReviewStatus } from '../../entities/review.entity';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  userName: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}

