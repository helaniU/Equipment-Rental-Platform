import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryLog, InventoryActionType } from '../database/entities/inventory-log.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { User } from '../database/entities/user.entity';
import { RecordInventoryActionDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryLog)
    private readonly logRepo: Repository<InventoryLog>,
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
  ) {}

  async recordAction(user: User, dto: RecordInventoryActionDto) {
    const equipment = await this.equipmentRepo.findOne({ where: { id: dto.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment item not found');

    // Adjust stock or availability depending on action type
    if (dto.action === InventoryActionType.MAINTENANCE || dto.action === InventoryActionType.DAMAGE || dto.action === InventoryActionType.RELEASE) {
      if (equipment.stockQuantity < dto.quantity) {
        throw new BadRequestException(`Cannot perform action: quantity exceeds current available stock (${equipment.stockQuantity})`);
      }
      equipment.stockQuantity -= dto.quantity;
      if (equipment.stockQuantity <= 0) {
        equipment.isAvailable = false;
      }
      await this.equipmentRepo.save(equipment);
    } else if (dto.action === InventoryActionType.RECEIVE) {
      equipment.stockQuantity += dto.quantity;
      equipment.isAvailable = true;
      await this.equipmentRepo.save(equipment);
    }

    const log = this.logRepo.create({
      equipment,
      performedBy: user,
      action: dto.action,
      quantity: dto.quantity,
      notes: dto.notes,
      repairCost: dto.repairCost,
    });

    return this.logRepo.save(log);
  }

  async findAllLogs(equipmentId?: string) {
    const query = this.logRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.equipment', 'equipment')
      .leftJoinAndSelect('log.performedBy', 'user');

    if (equipmentId) {
      query.andWhere('log.equipmentId = :equipmentId', { equipmentId });
    }

    return query.orderBy('log.createdAt', 'DESC').getMany();
  }
}