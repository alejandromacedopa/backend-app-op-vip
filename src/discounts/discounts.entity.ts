import { Product } from 'src/products/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DiscountStatus } from './status/discount-status';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  slogan: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToOne(() => Product, product => product.discounts, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'enum', enum: DiscountStatus, default: DiscountStatus.PENDING })
  status: DiscountStatus;

  @Column({ default: false })
  applied: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  @UpdateDateColumn()
  updatedAt: Date | null;
}
