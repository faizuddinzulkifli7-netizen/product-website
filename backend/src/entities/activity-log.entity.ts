import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum EntityType {
  PRODUCT = 'product',
  ORDER = 'order',
  USER = 'user',
  REVIEW = 'review',
  SYSTEM = 'system',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  action: string;

  @Column({ type: 'varchar' })
  entityType: EntityType;

  @Column({ nullable: true })
  entityId: string;

  @Column('text', { nullable: true })
  details: string;

  @CreateDateColumn()
  timestamp: Date;
}

