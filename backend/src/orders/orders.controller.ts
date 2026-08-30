import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CheckoutDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  SelectCryptoCoinDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(@Request() req: any, @Body() checkoutDto: CheckoutDto) {
    const userId = req.user?.id;
    return this.ordersService.createOrder(checkoutDto, userId);
  }

  // Public like /checkout — guest orders have no auth at all, and the
  // order id (a UUID) is already the effective bearer token for the
  // duration of the payment flow, same as the /webhooks/paygate status GET.
  @Post(':id/crypto-payment')
  async selectCryptoCoin(@Param('id') id: string, @Body() dto: SelectCryptoCoinDto) {
    return this.ordersService.selectCryptoCoin(id, dto.coinPath);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'manager';
    const orders = await this.ordersService.findAll(isAdmin ? undefined : userId);
    return orders.map((order) => this.formatOrder(order));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'manager';
    const order = await this.ordersService.findOne(id, isAdmin ? undefined : userId);
    return this.formatOrder(order);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.ordersService.updateStatus(id, updateOrderStatusDto);
    return this.formatOrder(order);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    const order = await this.ordersService.updatePaymentStatus(id, updatePaymentStatusDto);
    return this.formatOrder(order);
  }

  private formatOrder(order: any) {
    return {
      ...order,
      shippingAddress: JSON.parse(order.shippingAddress),
      items: order.items.map((item: any) => ({
        ...item,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
            }
          : null,
      })),
    };
  }
}

