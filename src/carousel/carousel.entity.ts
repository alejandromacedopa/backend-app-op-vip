import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('carousel')
export class Carousel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  is_enabled: boolean;

  @Column({ nullable: true })
  image1: string;
  // SOLO LA IMAGEN 1 ES OBLIGATORIO
  @Column({ nullable: true })
  image2?: string;

  @Column({ nullable: true })
  image3?: string;

  @Column({ nullable: true })
  image4?: string;

  @Column({ nullable: true })
  image5?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
