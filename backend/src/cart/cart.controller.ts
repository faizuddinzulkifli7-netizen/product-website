import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: any, @Query('guestId') guestId?: string) {
    const userId = req.user?.id;
    const cart = await this.cartService.getCart(userId, guestId);
    return {
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              inStock: item.product.inStock,
            }
          : null,
      })),
      userId: cart.userId,
      guestId: cart.guestId,
    };
  }

  @Post('add')
  async addToCart(@Request() req: any, @Body() addToCartDto: AddToCartDto, @Query('guestId') guestId?: string) {
    const userId = req.user?.id;
    const cart = await this.cartService.addToCart(addToCartDto, userId, guestId);
    return {
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              inStock: item.product.inStock,
            }
          : null,
      })),
    };
  }

  @Patch('items/:productId')
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Request() req: any,
    @Query('guestId') guestId?: string,
  ) {
    const userId = req.user?.id;
    const cart = await this.cartService.updateCartItem(productId, updateCartItemDto, userId, guestId);
    return {
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              inStock: item.product.inStock,
            }
          : null,
      })),
    };
  }

  @Delete('items/:productId')
  async removeFromCart(
    @Param('productId') productId: string,
    @Request() req: any,
    @Query('guestId') guestId?: string,
  ) {
    const userId = req.user?.id;
    const cart = await this.cartService.removeFromCart(productId, userId, guestId);
    return {
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              inStock: item.product.inStock,
            }
          : null,
      })),
    };
  }

  @Delete('clear')
  async clearCart(@Request() req, @Query('guestId') guestId?: string) {
    const userId = req.user?.id;
    await this.cartService.clearCart(userId, guestId);
    return { items: [] };
  }
}

