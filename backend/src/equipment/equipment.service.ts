import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../database/entities/equipment.entity';
import { Category } from '../database/entities/category.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  // Category Methods
  async createCategory(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAllCategories() {
    return this.categoryRepo.find();
  }

  // Equipment Methods
  async create(dto: CreateEquipmentDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const item = this.equipmentRepo.create({
      ...dto,
      category,
      isAvailable: dto.stockQuantity > 0,
    });

    return this.equipmentRepo.save(item);
  }

  async findAll(categoryId?: string) {
    const query = this.equipmentRepo.createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.category', 'category');

    if (categoryId) {
      query.where('category.id = :categoryId', { categoryId });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const item = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!item) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    const item = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      item.category = category;
    }

    Object.assign(item, dto);
    if (dto.stockQuantity !== undefined) {
      item.isAvailable = dto.stockQuantity > 0;
    }

    return this.equipmentRepo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    return this.equipmentRepo.remove(item);
  }
}