import { Category } from 'src/categories/categories.entity';
import { Discount } from 'src/discounts/discounts.entity';
import { OrderHasProducts } from 'src/orders/order_has_products.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
//import { OrderHasProducts } from '../orders/order_has_products.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image1: string;

  @Column({ nullable: true })
  image2: string;

  @Column({ nullable: true })
  image3: string;

  @Column({ nullable: true })
  id_category: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date | null;

  @ManyToOne(() => Category, category => category.id)
  @JoinColumn({ name: 'id_category' })
  category: Category;

  @OneToMany(() => OrderHasProducts, ohp => ohp.product)
  @JoinColumn({ referencedColumnName: 'id_product' })
  orderHasProducts: OrderHasProducts[];

  // RELATIONS WITH DESCOUNTS
  @OneToMany(() => Discount, discount => discount.product)
  discounts: Discount[];
}
