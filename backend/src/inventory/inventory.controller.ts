import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { RecordInventoryActionDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../database/entities/role.entity';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('logs')
  @Roles(RoleType.WAREHOUSE_OPERATOR, RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Record inventory event (Release, Receive, Damage, Maintenance)' })
  recordAction(@Request() req: any, @Body() dto: RecordInventoryActionDto) {
    return this.inventoryService.recordAction(req.user, dto);
  }

  @Get('logs')
  @Roles(RoleType.WAREHOUSE_OPERATOR, RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Get all inventory logs / audit history' })
  @ApiQuery({ name: 'equipmentId', required: false })
  getLogs(@Query('equipmentId') equipmentId?: string) {
    return this.inventoryService.findAllLogs(equipmentId);
  }
}