import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  WAREHOUSE_OPERATOR = 'WAREHOUSE_OPERATOR',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RoleType, unique: true })
  name: RoleType;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}