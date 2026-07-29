import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { RecordInventoryActionDto } from './dto/inventory-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../database/entities/role.entity';

@ApiTags('Inventory Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Get overview of all inventory items and stock levels' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Post('action')
  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Receive, release, record damage or maintenance for equipment' })
  recordAction(@Request() req: any, @Body() dto: RecordInventoryActionDto) {
    return this.inventoryService.recordAction(req.user, dto);
  }

  @Get('logs/:equipmentId')
  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Get stock action logs for an equipment item' })
  getLogs(@Param('equipmentId') equipmentId: string) {
    return this.inventoryService.getStockLogs(equipmentId);
  }
}