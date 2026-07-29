import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Role, RoleType } from '../entities/role.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const roleRepo = dataSource.getRepository(Role);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);

  console.log('Seeding Database...');

  // 1. Seed Roles
  const roles = [
    RoleType.ADMIN,
    RoleType.STAFF,
    RoleType.CUSTOMER,
    RoleType.WAREHOUSE_OPERATOR,
  ];

  for (const roleName of roles) {
    let role = await roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      role = roleRepo.create({ name: roleName });
      await roleRepo.save(role);
      console.log(`Created Role: ${roleName}`);
    }
  }

  // 2. Seed Categories
  const categories = ['Cameras & Lenses', 'Lighting & Grip', 'Audio Equipment', 'Drones', 'Heavy Machinery'];
  for (const catName of categories) {
    let cat = await categoryRepo.findOne({ where: { name: catName } });
    if (!cat) {
      cat = categoryRepo.create({ name: catName, description: `${catName} category` });
      await categoryRepo.save(cat);
      console.log(`Created Category: ${catName}`);
    }
  }

  // 3. Seed Initial Admin User
  const adminRole = await roleRepo.findOne({ where: { name: RoleType.ADMIN } });
  const adminEmail = 'admin@rental.com';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });

  if (!admin && adminRole) {
    const hashedPassword = await bcrypt.hash('Admin@12345', 10);
    admin = userRepo.create({
      email: adminEmail,
      passwordHash: hashedPassword,
      fullName: 'System Admin',
      phone: '+94770000000',
      role: adminRole,
    });
    await userRepo.save(admin);
    console.log('Created Default Admin User: admin@rental.com / Admin@12345');
  }

  console.log('Seeding Complete!');
  await app.close();
}

bootstrap();