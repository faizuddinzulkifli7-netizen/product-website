import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(userId?: string, guestId?: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: userId ? { userId } : { guestId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      const newCart = this.cartRepository.create({
        userId,
        guestId,
        items: [],
      });
      return this.cartRepository.save(newCart);
    }

    return cart;
  }

  async addToCart(
    addToCartDto: AddToCartDto,
    userId?: string,
    guestId?: string,
  ): Promise<Cart> {
    const product = await this.productRepository.findOne({
      where: { id: addToCartDto.productId },
    });

    if (!product || !product.isActive || !product.inStock) {
      throw new NotFoundException('Product not available');
    }

    if (product.stockLevel < addToCartDto.quantity) {
      throw new Error('Insufficient stock');
    }

    let cart = await this.getCart(userId, guestId);
    const existingItem = cart.items.find(
      (item) => item.productId === addToCartDto.productId,
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      });
      cart.items.push(await this.cartItemRepository.save(newItem));
    }

    return this.getCart(userId, guestId);
  }

  async updateCartItem(
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
    userId?: string,
    guestId?: string,
  ): Promise<Cart> {
    const cart = await this.getCart(userId, guestId);
    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateCartItemDto.quantity === 0) {
      await this.cartItemRepository.remove(item);
    } else {
      item.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId, guestId);
  }

  async removeFromCart(
    productId: string,
    userId?: string,
    guestId?: string,
  ): Promise<Cart> {
    const cart = await this.getCart(userId, guestId);
    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(item);
    return this.getCart(userId, guestId);
  }

  async clearCart(userId?: string, guestId?: string): Promise<void> {
    const cart = await this.getCart(userId, guestId);
    await this.cartItemRepository.remove(cart.items);
  }
}

