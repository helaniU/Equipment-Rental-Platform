import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../database/entities/role.entity';

@ApiTags('Equipment & Categories')
@Controller()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // --- PUBLIC / ALL USERS ENDPOINTS ---

  @Get('categories')
  @ApiOperation({ summary: 'List all equipment categories' })
  getCategories() {
    return this.equipmentService.findAllCategories();
  }

  @Get('equipment')
  @ApiOperation({ summary: 'List all equipment items with search & category filter' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  getEquipment(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.equipmentService.findAllEquipment(categoryId, search);
  }

  @Get('equipment/:id')
  @ApiOperation({ summary: 'Get single equipment details' })
  getEquipmentById(@Param('id') id: string) {
    return this.equipmentService.findOneEquipment(id);
  }

  // --- WAREHOUSE OPERATOR ONLY ENDPOINTS ---

  @Post('categories')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Create new equipment category (Warehouse Operator only)' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.equipmentService.createCategory(dto);
  }

  @Put('categories/:id')
  @Patch('categories/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Update equipment category (Warehouse Operator only)' })
  updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.equipmentService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Delete category (Warehouse Operator only)' })
  deleteCategory(@Param('id') id: string) {
    return this.equipmentService.deleteCategory(id);
  }

  @Post('equipment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Create new equipment item (Warehouse Operator only)' })
  createEquipment(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(dto);
  }

  @Put('equipment/:id')
  @Patch('equipment/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Update equipment item (Warehouse Operator only)' })
  updateEquipment(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.updateEquipment(id, dto);
  }

  @Delete('equipment/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Delete equipment item (Warehouse Operator only)' })
  deleteEquipment(@Param('id') id: string) {
    return this.equipmentService.deleteEquipment(id);
  }
}