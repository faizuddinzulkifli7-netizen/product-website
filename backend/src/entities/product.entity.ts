import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Review } from './review.entity';
import { CartItem } from './cart-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  shortDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  image: string;

  @Column()
  category: string;

  @Column({ default: true })
  inStock: boolean;

  @Column({ type: 'int', default: 0 })
  stockLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isVisible: boolean;

  @Column('text', { nullable: true })
  specifications: string; // JSON string

  @Column('text', { nullable: true })
  usage: string;

  @Column('text', { nullable: true })
  storage: string;

  @Column('text', { nullable: true })
  warnings: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}

