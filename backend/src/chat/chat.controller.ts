import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ParamIdDto } from './interfaces/ParamIdDto';
import { SendMessageDto } from './interfaces/SendMessageDto';
import { SupportRequestDocument } from './schemas/SupportRequest.schema';
import { ReadMessageDto } from './interfaces/ReadMessageDTO';
import { JwtManager } from 'src/auth/jwt.auth.manager';
import { JwtClient } from 'src/auth/jwt.client';
import { JwtClientManager } from 'src/auth/jwtClientManager';

@Controller('api')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtClientManager)
  @Post('common/support-requests/:id/messages') // добавить сообщение
  public addMessage(
    @Param() { id }: ParamIdDto,
    @Body() body: SendMessageDto,
  ): Promise<SupportRequestDocument> {
    return this.chatService.addMessage(body, id);
  }

  @UseGuards(JwtClientManager)
  @Post('common/support-requests/:id/messages/read') // Прочитать сообщение
  public readMessage(
    @Param() { id }: ParamIdDto,
    @Body() body: ReadMessageDto,
  ): any {
    return this.chatService.readMessage(body, id);
  }

  @UseGuards(JwtClient)
  @Get('client/support-requests')
  public findUserRequest(@Query() params: any): any {
    return this.chatService.findUserRequest(params);
  }

  @UseGuards(JwtManager)
  @Get('manager/support-request')
  public findRequestById(@Query() params: any): any {
    return this.chatService.findRequestById(params);
  }

  @UseGuards(JwtManager)
  @Get('manager/support-requests-users')
  public getUsersFromRequests(): Promise<any> {
    return this.chatService.getUsersFromRequests();
  }
}
