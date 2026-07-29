import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Equipment } from './equipment.entity';

@Entity('reservation_items')
export class ReservationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => Equipment, (equipment) => equipment.reservationItems)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
}