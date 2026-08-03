import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '../../database/entities/role.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are defined on controller/handler, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Support both user.role string or user.role.name object structure
    const userRole = typeof user.role === 'object' ? user.role?.name : user.role;

    const hasRole = requiredRoles.some((role) => role === userRole);

    if (!hasRole) {
      throw new ForbiddenException(`User role '${userRole}' does not have access to this resource`);
    }

    return true;
  }
}