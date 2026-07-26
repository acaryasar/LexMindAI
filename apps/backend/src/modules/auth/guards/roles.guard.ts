import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    // Handle both string array (from JWT) and object array (from database)
    const userRoles = Array.isArray(user.roles) && typeof user.roles[0] === 'string'
      ? user.roles
      : user.roles.map((ur: any) => ur.role?.name || ur.role);
    
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
