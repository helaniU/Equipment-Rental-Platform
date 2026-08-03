import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum UploadType {
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  RENTAL_AGREEMENT = 'RENTAL_AGREEMENT',
  EQUIPMENT_IMAGE = 'EQUIPMENT_IMAGE',
}

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: UploadType,
    default: UploadType.IDENTITY_DOCUMENT,
  })
  type: UploadType;

  @Column({ nullable: true })
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;
}