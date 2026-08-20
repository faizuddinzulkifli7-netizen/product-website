import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Order, PaymentStatus, OrderStatus } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { User, UserRole } from '../entities/user.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/user.dto';

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

  // Staff accounts only (admin/manager) — this page is for internal
  // permissions management, not the customer user base.
  async getStaffUsers(): Promise<User[]> {
    return this.usersRepository.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.MANAGER }],
      order: { createdAt: 'DESC' },
    });
  }

  async createStaffUser(dto: CreateAdminUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role,
      isActive: true,
    });
    return this.usersRepository.save(user);
  }

  async updateStaffUser(id: string, dto: UpdateAdminUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // dto's untouched optional fields are still own properties set to
    // undefined (TS class fields), so a blind Object.assign would overwrite
    // user.name/role/etc. with undefined even when the request omitted them.
    const { password, ...rest } = dto;
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        (user as any)[key] = value;
      }
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    return this.usersRepository.save(user);
  }

  async deleteStaffUser(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.remove(user);
  }
}

