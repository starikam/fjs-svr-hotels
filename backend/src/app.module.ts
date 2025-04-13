import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelsModule } from './hotels/hotels.module';
import { ChatModule } from './chat/chat.module';
import { WebsocetsGateway } from './websocets/websocets.gateway';

console.log('==============================================');
console.log('process.env.MONGO_CONNECTION', process.env.MONGO_CONNECTION);
console.log('==============================================');

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    HotelsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebsocetsGateway],
})
export class AppModule {}
