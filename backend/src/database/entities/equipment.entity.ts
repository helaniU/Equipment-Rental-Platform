import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
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

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  rentalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  deposit: number;

  @Column('int')
  stockQuantity: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column('jsonb', { nullable: true })
  specifications: Record<string, any>;

  @Column('simple-array', { nullable: true })
  images: string[];

  @ManyToOne(() => Category, (category) => category.equipment, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ReservationItem, (item) => item.equipment)
  reservationItems: ReservationItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}