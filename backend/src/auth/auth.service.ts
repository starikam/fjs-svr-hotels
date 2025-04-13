import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ICreateUserDto } from 'src/users/interfaces/dto/create-user';
import * as bcrypt from 'bcrypt';
import { IUserFromFrontDto } from 'src/users/interfaces/dto/userFromFront';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ===========================================================
  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(email);
      console.log('auth.service.validateUser =3===', user);
      // Проверка хэша
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (user && isMatch) {
        return {
          _id: user._id,
          contactPhone: user.contactPhone,
          mail: user.email,
          name: user.name,
          role: user.role,
        };
      }
    } catch (err) {
      throw new UnauthorizedException(
        'Пользователь с таким E-mail не зарегистрирован или не верный пароль.',
      );
    }
  }

  async login(user: any) {
    const payload = { email: user.mail, id: String(user._id), role: user.role };
    console.log('aut.service-login===', payload);
    const newToken = this.jwtService.sign(payload);
    console.log('newToken=', newToken);
    return {
      access_token: newToken,
      user,
    };
  }

  async register(userNew: IUserFromFrontDto) {
    const user = await this.usersService.createUser(userNew);

    const payload = { email: user.email, id: String(user._id) };
    const { passwordHash, ...result } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  createToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  testtoken() {
    return { statusCode: 200, message: 'Успешный доступ к закрытой странице' };
  }
}
