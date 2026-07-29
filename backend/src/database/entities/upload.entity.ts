import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fileName!: string;

  @Column()
  fileUrl!: string;

  @Column()
  fileType!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  uploadedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}