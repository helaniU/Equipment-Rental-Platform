import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany, // <--- ADDED MISSING IMPORT
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ReservationItem } from './reservation-item.entity';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rentalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deposit: number;

  @Column({ type: 'int', default: 1 })
  stockQuantity: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @OneToMany(() => ReservationItem, (item) => item.equipment)
  reservationItems: ReservationItem[];

  @ManyToOne(() => Category, (category) => category.equipment, {
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}