import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentStatus, OrderStatus } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { ActivityLog } from '../entities/activity-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

  async getDashboardMetrics() {
    const orders = await this.ordersRepository.find();
    const products = await this.productsRepository.find();
    const users = await this.usersRepository.find();

    const totalSales = orders
      .filter((o) => o.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING).length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const totalUsers = users.length;

    const recentOrders = orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: Number(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      }));

    // Generate sales by month for last 6 months
    const salesByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const sales = orders
        .filter((o) => {
          const orderDate = new Date(o.createdAt);
          return (
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear() &&
            o.paymentStatus === PaymentStatus.PAID
          );
        })
        .reduce((sum, o) => sum + Number(o.total), 0);
      return { month, sales };
    });

    const ordersByStatus = [
      { status: OrderStatus.PENDING, count: orders.filter((o) => o.status === OrderStatus.PENDING).length },
      { status: OrderStatus.PROCESSING, count: orders.filter((o) => o.status === OrderStatus.PROCESSING).length },
      { status: OrderStatus.SHIPPED, count: orders.filter((o) => o.status === OrderStatus.SHIPPED).length },
      { status: OrderStatus.DELIVERED, count: orders.filter((o) => o.status === OrderStatus.DELIVERED).length },
      { status: OrderStatus.CANCELLED, count: orders.filter((o) => o.status === OrderStatus.CANCELLED).length },
    ];

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      activeProducts,
      totalUsers,
      recentOrders,
      salesByMonth,
      ordersByStatus,
    };
  }

  async getActivityLogs(limit: number = 100) {
    return this.activityLogsRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async logActivity(
    userId: string,
    userName: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: string,
  ) {
    const log = this.activityLogsRepository.create({
      userId,
      userName,
      action,
      entityType: entityType as any,
      entityId,
      details,
    });
    return this.activityLogsRepository.save(log);
  }
}

