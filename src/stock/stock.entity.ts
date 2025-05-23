import { Product } from 'src/products/product.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stocks' })
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  id_product: number;

  @Column()
  quantity: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date | null;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'id_product' })
  product: Product;
}
