import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLog } from '../database/entities/inventory-log.entity';
import { Equipment } from '../database/entities/equipment.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryLog, Equipment])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}