import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Role, RoleType } from '../entities/role.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { Equipment } from '../entities/equipment.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const roleRepo = dataSource.getRepository(Role);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const equipmentRepo = dataSource.getRepository(Equipment);

  console.log('🌱 Seeding Database...');

  // 1. Seed Roles
  const roles = [
    RoleType.ADMIN,
    RoleType.STAFF,
    RoleType.CUSTOMER,
    RoleType.WAREHOUSE_OPERATOR,
  ];

  const rolesMap = new Map<RoleType, Role>();
  for (const roleName of roles) {
    let role = await roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      role = roleRepo.create({ name: roleName });
      await roleRepo.save(role);
      console.log(`✅ Created Role: ${roleName}`);
    }
    rolesMap.set(roleName, role);
  }

  // 2. Seed Categories
  const categories = [
    { name: 'Cameras & Lenses', description: 'DSLRs, Mirrorless & Lenses' },
    { name: 'Lighting & Grip', description: 'LED Panels, Softboxes & Stands' },
    { name: 'Audio Equipment', description: 'Mics, Recorders & Wireless Kits' },
    { name: 'Drones', description: 'Aerial Drones & Gimbal Accessories' },
    { name: 'Heavy Machinery', description: 'Industrial & Construction Gear' },
  ];

  const categoriesMap = new Map<string, Category>();
  for (const catObj of categories) {
    let cat = await categoryRepo.findOne({ where: { name: catObj.name } });
    if (!cat) {
      cat = categoryRepo.create({ name: catObj.name, description: catObj.description });
      await categoryRepo.save(cat);
      console.log(`📁 Created Category: ${catObj.name}`);
    }
    categoriesMap.set(catObj.name, cat);
  }

  // 3. Seed Users (Admin, Staff, Customer)
  const defaultPassword = await bcrypt.hash('Admin@12345', 10);
  const usersToSeed = [
    { email: 'admin@rental.com', name: 'System Admin', role: RoleType.ADMIN, phone: '+94770000000' },
    { email: 'staff@rental.com', name: 'Sarah Staff', role: RoleType.STAFF, phone: '+94771111111' },
    { email: 'customer@rental.com', name: 'John Customer', role: RoleType.CUSTOMER, phone: '+94772222222' },
  ];

  for (const u of usersToSeed) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    const targetRole = rolesMap.get(u.role);

    if (!user && targetRole) {
      user = userRepo.create({
        email: u.email,
        passwordHash: defaultPassword,
        fullName: u.name,
        phone: u.phone,
        role: targetRole,
      });
      await userRepo.save(user);
      console.log(`👤 Created User: ${u.email} (${u.role})`);
    }
  }

  // 4. Seed Sample Equipment (Matching your Equipment Entity)
  const sampleEquipment = [
    {
      name: 'Sony A7 IV Mirrorless Camera',
      description: '33MP Full-Frame mirrorless camera for high quality video & photo.',
      rentalPrice: 45.00,
      deposit: 100.00,
      stockQuantity: 3,
      isAvailable: true,
      category: categoriesMap.get('Cameras & Lenses'),
    },
    {
      name: 'Rode Wireless GO II Dual Kit',
      description: 'Compact dual-channel wireless microphone system.',
      rentalPrice: 15.00,
      deposit: 50.00,
      stockQuantity: 5,
      isAvailable: true,
      category: categoriesMap.get('Audio Equipment'),
    },
    {
      name: 'Aputure Amaran 200d Light',
      description: '200W daylight point-source LED fixture with Bowens mount.',
      rentalPrice: 25.00,
      deposit: 60.00,
      stockQuantity: 2,
      isAvailable: true,
      category: categoriesMap.get('Lighting & Grip'),
    },
    {
      name: 'DJI Mini 3 Pro Drone',
      description: '4K HDR Lightweight mini camera drone with tri-directional obstacle sensing.',
      rentalPrice: 50.00,
      deposit: 150.00,
      stockQuantity: 2,
      isAvailable: true,
      category: categoriesMap.get('Drones'),
    },
  ];

  for (const eq of sampleEquipment) {
    let existingEq = await equipmentRepo.findOne({ where: { name: eq.name } });
    if (!existingEq && eq.category) {
      existingEq = equipmentRepo.create(eq);
      await equipmentRepo.save(existingEq);
      console.log(`🎥 Created Equipment: ${eq.name}`);
    }
  }

  console.log('✨ Seeding Complete!');
  await app.close();
}

bootstrap();