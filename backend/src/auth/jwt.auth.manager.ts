import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtManager extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован.');
    } else if (user && user.role !== 'manager') {
      throw new ForbiddenException(
        'Пользователю запрещено выполнять этот запросю',
      );
    }
    return user;
  }
}
