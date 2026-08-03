import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Equipment } from './equipment.entity';
import { User } from './user.entity';

export enum InventoryActionType {
  RELEASE = 'RELEASE',
  RECEIVE = 'RECEIVE',
  DAMAGE = 'DAMAGE',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('inventory_logs')
export class InventoryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Equipment, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;

  @Column()
  equipmentId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'performedById' })
  performedBy: User;

  @Column()
  performedById: string;

  @Column({
    type: 'enum',
    enum: InventoryActionType,
  })
  action: InventoryActionType;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  repairCost: number;

  @CreateDateColumn()
  createdAt: Date;
}