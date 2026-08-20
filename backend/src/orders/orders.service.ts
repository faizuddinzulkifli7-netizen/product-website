import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { CheckoutDto, UpdateOrderStatusDto, UpdatePaymentStatusDto } from './dto/order.dto';
import { PAYMENT_GATEWAY } from '../payment/payment-gateway.interface';
import type { PaymentGateway } from '../payment/payment-gateway.interface';
import { ProductsService } from '../products/products.service';
import { PayGateService } from '../payment/paygate.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(PAYMENT_GATEWAY)
    private paymentGateway: PaymentGateway,
    private productsService: ProductsService,
    private currencyService: CurrencyService,
  ) {}

  async createOrder(checkoutDto: CheckoutDto, userId?: string): Promise<{ order: Order; paymentUrl: string }> {
    const cart = await this.cartRepository.findOne({
      where: userId ? { userId } : { guestId: checkoutDto.guestId },
      relations: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate product availability and calculate totals
    let subtotal = 0;
    let allFreeShipping = true;
    const orderItems: OrderItem[] = [];

    for (const cartItem of cart.items) {
      const product = await this.productRepository.findOne({
        where: { id: cartItem.productId },
      });

      if (!product || !product.isActive || !product.inStock) {
        throw new BadRequestException(`Product ${product?.name || cartItem.productId} is not available`);
      }

      if (product.stockLevel < cartItem.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      if (!product.freeShipping) {
        allFreeShipping = false;
      }

      const itemPrice = product.price;
      const itemSubtotal = itemPrice * cartItem.quantity;
      subtotal += itemSubtotal;

      const orderItem = this.orderItemsRepository.create({
        productId: product.id,
        productName: product.name,
        quantity: cartItem.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
      });
      orderItems.push(orderItem);
    }

    // Flat $10 shipping, waived only when every item in the cart is flagged free-shipping.
    const shipping = allFreeShipping ? 0 : 10;
    const total = subtotal + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().padStart(10, '0')}`;

    // Create order
    const order = this.ordersRepository.create({
      orderNumber,
      userId,
      guestId: checkoutDto.guestId,
      customerName: `${checkoutDto.firstName} ${checkoutDto.lastName}`,
      customerEmail: checkoutDto.email,
      customerPhone: checkoutDto.phone,
      shippingAddress: JSON.stringify(checkoutDto.shippingAddress),
      items: orderItems,
      subtotal,
      shipping,
      total,
      status: OrderStatus.CREATED,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: 'PAYGATE',
    });

    const savedOrder = await this.ordersRepository.save(order);

    // All amounts above are computed and stored in USD, our source of
    // truth. Only the payment-gateway-facing amount is converted, so the
    // customer pays (and PayGate's provider list is chosen) in their
    // selected currency without touching stored order totals.
    const currency = checkoutDto.currency || 'EUR';
    const gatewayAmount = await this.currencyService.convertFromUsd(total, currency);

    // Create payment request. 'crypto' bypasses the card/onramp selector
    // entirely for customers paying directly from their own BTC/EVM wallet.
    const { paymentUrl, requestId } =
      checkoutDto.paymentType === 'crypto' &&
      this.paymentGateway instanceof PayGateService
        ? await this.paymentGateway.createDirectCryptoPayment(
            savedOrder.id,
            gatewayAmount,
            currency,
          )
        : await this.paymentGateway.createPaymentRequest(
            savedOrder.id,
            gatewayAmount,
            currency,
            checkoutDto.email,
          );

    savedOrder.paymentRequestId = requestId;
    await this.ordersRepository.save(savedOrder);

    // Clear cart
    await this.cartRepository.remove(cart);

    return { order: savedOrder, paymentUrl };
  }

  async findAll(userId?: string): Promise<Order[]> {
    if (userId) {
      return this.ordersRepository.find({
        where: { userId },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.ordersRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.ordersRepository.findOne({
      where,
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status as OrderStatus;
    
    if (order.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }
    if (order.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return this.ordersRepository.save(order);
  }

  async updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.paymentStatus = updatePaymentStatusDto.paymentStatus as PaymentStatus;
    
    if (order.paymentStatus === PaymentStatus.PAID) {
      // Update stock levels
      for (const item of order.items) {
        await this.productsService.updateStock(item.productId, item.quantity);
      }
    }

    return this.ordersRepository.save(order);
  }

  async handlePaymentWebhook(orderId: string, transactionId: string, status: string): Promise<Order> {
    const order = await this.findOne(orderId);
    
    if (status === 'paid' || status === 'completed') {
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentTransactionId = transactionId;
      order.status = OrderStatus.PENDING;
      
      // Update stock levels
      for (const item of order.items) {
        await this.productsService.updateStock(item.productId, item.quantity);
      }
    } else if (status === 'failed' || status === 'cancelled') {
      order.paymentStatus = PaymentStatus.FAILED;
    }

    return this.ordersRepository.save(order);
  }
}

