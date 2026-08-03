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
import { Role } from './role.entity';
import { Reservation } from './reservation.entity';
import { ActivityLog } from './activity-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => ActivityLog, (log) => log.user)
  activityLogs: ActivityLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}