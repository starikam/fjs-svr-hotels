import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAdminManager extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('==== JwtAdminManager === user', user);
    const roles = ['admin', 'manager'];
    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован.');
    } else if (user && !roles.includes(user.role)) {
      throw new ForbiddenException(
        'Пользователю запрещено выполнять этот запросю',
      );
    }
    return user;
  }
}
