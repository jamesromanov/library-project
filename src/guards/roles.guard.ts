import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AdminRole } from 'src/admin-auth/admin.role';
import { ROLES_KEY } from './roles';
import { Request } from 'express';
import { Languages } from 'src/books/languages';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRole = this.reflector.getAllAndOverride<AdminRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRole) return true;

      const { user } = context.switchToHttp().getRequest<Request>();
      if (!user) throw new UnauthorizedException("Ro'yhatdan o'tilmagan");
      if (!requiredRole.includes(user?.role))
        throw new UnauthorizedException(
          "Sizda buni qilishingiz uchun huquqingiz yo'q",
        );
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
    return true;
  }
}
