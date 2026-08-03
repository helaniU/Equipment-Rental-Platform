// backend/src/database/entities/reservation.entity.ts

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
import { User } from './user.entity';
import { ReservationItem } from './reservation-item.entity';

// EXPORT THIS ENUM
export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Use 'user' as the relation property name
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  // Add OneToMany relation for items
  @OneToMany(() => ReservationItem, (item) => item.reservation, { cascade: true })
  items: ReservationItem[];

  @Column({ type: 'date' })
  pickupDate: Date;

  @Column({ type: 'date' })
  returnDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  depositAmount: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  qrCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}