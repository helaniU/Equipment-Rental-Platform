import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../database/entities/role.entity';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);