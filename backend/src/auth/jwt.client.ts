import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtClient extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('==== JwtAdmin === user', user);
    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован.');
    } else if (user && user.role !== 'client') {
      throw new ForbiddenException(
        'Пользователю запрещено выполнять этот запросю',
      );
    }
    return user;
  }
}
