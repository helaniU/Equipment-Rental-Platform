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
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // --- Category Operations ---
  async createCategory(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAllCategories() {
    return this.categoryRepo.find({ relations: ['equipment'] });
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string) {
    const result = await this.categoryRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }

  // --- Equipment Operations ---
  async createEquipment(dto: CreateEquipmentDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const equipment = this.equipmentRepo.create({ ...dto, category });
    return this.equipmentRepo.save(equipment);
  }

  async findAllEquipment(categoryId?: string, search?: string) {
    const query = this.equipmentRepo.createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.category', 'category');

    if (categoryId) {
      query.andWhere('equipment.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      query.andWhere('equipment.name ILIKE :search OR equipment.description ILIKE :search', { search: `%${search}%` });
    }

    return query.getMany();
  }

  async findOneEquipment(id: string) {
    const equipment = await this.equipmentRepo.findOne({ where: { id }, relations: ['category'] });
    if (!equipment) throw new NotFoundException('Equipment item not found');
    return equipment;
  }

  async updateEquipment(id: string, dto: UpdateEquipmentDto) {
    const equipment = await this.findOneEquipment(id);
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      equipment.category = category;
    }
    Object.assign(equipment, dto);
    return this.equipmentRepo.save(equipment);
  }

  async deleteEquipment(id: string) {
    const result = await this.equipmentRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Equipment item not found');
    return { message: 'Equipment deleted successfully' };
  }
}