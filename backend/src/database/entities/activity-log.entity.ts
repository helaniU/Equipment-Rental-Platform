import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  INVENTORY_RECEIVE = 'INVENTORY_RECEIVE',
  INVENTORY_RELEASE = 'INVENTORY_RELEASE',
  INVENTORY_DAMAGE = 'INVENTORY_DAMAGE',
  INVENTORY_MAINTENANCE = 'INVENTORY_MAINTENANCE',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.activityLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ActionType })
  action: ActionType;

  @Column('jsonb', { nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}