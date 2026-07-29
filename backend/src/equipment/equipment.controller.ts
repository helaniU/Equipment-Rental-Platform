import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
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
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'List all equipment categories' })
  getCategories() {
    return this.equipmentService.findAllCategories();
  }

  @Post('categories')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Create a new equipment category (Admin/Staff only)' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.equipmentService.createCategory(dto);
  }

  // Equipment CRUD
  @Get()
  @ApiOperation({ summary: 'List all equipment (Supports category filtering)' })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.equipmentService.findAll(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment details by ID' })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Add new equipment item (Admin/Staff only)' })
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @ApiOperation({ summary: 'Update equipment details (Admin/Staff only)' })
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete equipment item (Admin only)' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
}