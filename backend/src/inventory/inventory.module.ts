import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Equipment } from '../database/entities/equipment.entity';
import { ActivityLog } from '../database/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, ActivityLog])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}