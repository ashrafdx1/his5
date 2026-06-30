import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // If no roles are annotated, anyone can access
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied. Insufficient role clearances.');
    }

    const request = context.switchToHttp().getRequest();
    const isDelete = request.method === 'DELETE';

    if (user.isHRManager === true && isDelete) {
      throw new ForbiddenException('Deletion is restricted to Administrators only.');
    }

    const userRoles = user.roles.map((r: string) => r.toUpperCase());
    const requiredRolesUpper = requiredRoles.map((r: string) => r.toUpperCase());

    const hasRole = userRoles.some((role: string) => {
      // Treat ADMIN and ADMINISTRATOR as equivalent matching states
      if (role === 'ADMINISTRATOR' && requiredRolesUpper.includes('ADMIN')) return true;
      if (role === 'ADMIN' && requiredRolesUpper.includes('ADMINISTRATOR')) return true;
      return requiredRolesUpper.includes(role);
    }) || (user.isHRManager === true && (requiredRolesUpper.includes('ADMIN') || requiredRolesUpper.includes('ADMINISTRATOR')));

    if (!hasRole) {
      throw new ForbiddenException('Access denied. Insufficient role clearances.');
    }

    return true;
  }
}
