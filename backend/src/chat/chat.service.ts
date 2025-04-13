import { Injectable, Post } from '@nestjs/common';
import {
  SupportRequest,
  SupportRequestDocument,
} from './schemas/SupportRequest.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/Message.schema';
import { SendMessageDto } from './interfaces/SendMessageDto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { ReadMessageDto } from './interfaces/ReadMessageDTO';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(SupportRequest.name)
    private SupportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name) private MessageModel: Model<MessageDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  //============================ Для разработки
  public async delallMessage(): Promise<any> {
    const returnA = await this.SupportRequestModel.deleteMany({});
    const returnB = await this.MessageModel.deleteMany({});
    return returnB;
  }

  //============================
  public async createMessage(body: SendMessageDto): Promise<MessageDocument> {
    const { author, text } = body;
    const newMessage = {
      author: author,
      sentAt: new Date(),
      text: text,
      readAt: null,
    };
    const returnMessage = await this.MessageModel.create(newMessage);

    return returnMessage;
  }

  //============================
  public async getChat(
    params: {
      id: string;
      author: string;
    },
    newMessage: MessageDocument,
  ): Promise<SupportRequestDocument> {
    const { id, author } = params;
    // Если ID === "newchat" создаем новый, иначе берем по ID
    let returnChat: any;
    let msgs: any;
    if (id === 'newchat') {
      msgs = [];
      msgs.push(newMessage._id);
      const newChat = {
        user: author,
        createdAt: new Date(),
        messages: msgs,
        isActive: true,
      };
      returnChat = await this.SupportRequestModel.create(newChat);
    } else {
      const chat = await this.SupportRequestModel.findById(id);
      msgs = chat.messages;
      msgs.push(newMessage._id);
      returnChat = await this.SupportRequestModel.findByIdAndUpdate(
        chat._id,
        { messages: msgs },
        {
          returnDocument: 'after',
        },
      );
    }

    return returnChat;
  }

  //============================
  public async addMessage(
    body: SendMessageDto,
    id: string,
  ): Promise<SupportRequestDocument> {
    const paramsForChat = { id, author: body.author };
    // Созаем сообщение
    const newMessage = await this.createMessage(body);
    // Получаем либо создаем Чат
    const currentChat = await this.getChat(paramsForChat, newMessage);
    const newCurrentChat = currentChat;

    return newCurrentChat;
  }

  //============================
  public async readMessage(body: ReadMessageDto, id: string): Promise<any> {
    const reaadDate = new Date();
    const { createdBefore } = body;
    createdBefore.forEach((i) => {
      const fnUpdate = async () => {
        await this.MessageModel.findByIdAndUpdate(
          i,
          { readAt: reaadDate },
          {
            returnDocument: 'after',
          },
        );
      };
      fnUpdate();
    });

    return {
      success: true,
    };
  }

  public async findUserRequest(params): Promise<any> {
    const { id } = params;
    const response = await this.SupportRequestModel.find({ user: id })
      .populate('messages')
      .exec();

    return response;
  }

  public async findRequestById(params): Promise<any> {
    const { id } = params;
    const response = await this.SupportRequestModel.findById(id)
      .populate('messages')
      .exec();

    return response;
  }

  public async getUsersFromRequests(): Promise<any> {
    const response = await this.SupportRequestModel.find()
      .select(['-__v', '-isActive', '-createdAt', '-messages'])
      .populate('user', ['name'])
      .exec();

    return response;
  }
}