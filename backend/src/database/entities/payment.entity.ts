import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { User } from './user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentType {
  RENTAL_FEE = 'RENTAL_FEE',
  DEPOSIT = 'DEPOSIT',
  DAMAGE_FEE = 'DAMAGE_FEE',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @Column()
  reservationId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.RENTAL_FEE,
  })
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionReference: string;

  @Column({ nullable: true })
  paymentMethod: string; // e.g., 'MOCK_CARD', 'CASH'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}