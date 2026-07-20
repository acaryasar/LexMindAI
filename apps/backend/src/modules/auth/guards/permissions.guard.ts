import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    const userPermissions = new Set<string>();
    user.roles.forEach((userRole: any) => {
      userRole.role.permissions.forEach((rolePermission: any) => {
        userPermissions.add(rolePermission.permission.name);
      });
    });

    return requiredPermissions.every((permission) => userPermissions.has(permission));
  }
}
