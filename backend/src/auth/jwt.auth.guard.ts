import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('=== Ayth.Guard JWT err: ', err);
    console.log('=== Ayth.Guard JWT USER: ', user);
    console.log('=== Ayth.Guard JWT info: ', info);
    if (err || !user || user?.role !== 'admin') {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
