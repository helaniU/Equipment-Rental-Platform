import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../database/entities/equipment.entity';
import { User } from '../database/entities/user.entity';
import { RecordInventoryActionDto, InventoryActionType } from './dto/inventory-action.dto';
import { ActivityLog, ActionType } from '../database/entities/activity-log.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
    @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
  ) {}

  async recordAction(operator: User, dto: RecordInventoryActionDto) {
    const equipment = await this.equipmentRepo.findOne({ where: { id: dto.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment not found');

    switch (dto.action) {
      case InventoryActionType.RECEIVE:
        equipment.stockQuantity += dto.quantity;
        break;

      case InventoryActionType.RELEASE:
      case InventoryActionType.DAMAGE:
      case InventoryActionType.MAINTENANCE:
        if (equipment.stockQuantity < dto.quantity) {
          throw new BadRequestException('Insufficient stock for this action');
        }
        equipment.stockQuantity -= dto.quantity;
        break;
    }

    equipment.isAvailable = equipment.stockQuantity > 0;
    await this.equipmentRepo.save(equipment);

    // Save activity log matching your entity schema
    const actionKey = `INVENTORY_${dto.action}` as keyof typeof ActionType;
    const actionValue = ActionType[actionKey] ?? ActionType.UPDATE;

    const log = this.logRepo.create({
      action: actionValue,
      details: { 
        userId: operator.id,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        actionType: dto.action, 
        quantity: dto.quantity, 
        notes: dto.notes, 
        reservationId: dto.reservationId 
      },
    });
    await this.logRepo.save(log);

    return { message: `Inventory action ${dto.action} processed successfully`, equipment };
  }

  async getStockLogs(equipmentId: string) {
    return this.logRepo
      .createQueryBuilder('log')
      .where("log.details ->> 'equipmentId' = :equipmentId", { equipmentId })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }
}