import { Injectable } from '@nestjs/common';
import { Hotel, HotelDocument } from './schemas/hotels.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ICreateHotelDto } from './interfaces/dto/create-hotel';
import { IUpdateHotelDto } from './interfaces/dto/update-hotel';
import { INewHotelBodyDto } from './interfaces/dto/new-hotel-body';

@Injectable()
export class HotelsService {
  constructor(
    @InjectModel(Hotel.name) private HotelModel: Model<HotelDocument>,
  ) {}

  //=============================================================
  public async findAll(params: any): Promise<HotelDocument[]> {
    console.log('serv params', params);
    const { offset, limit, search } = params;
    const qOffset = Number(offset);
    const qLimit = Number(limit);
    const searchString = new RegExp(search === '' ? '.' : search, 'i');
    const data = await this.HotelModel.find({ title: searchString })
      .skip(qOffset * qLimit)
      .limit(qLimit + 1)
      .exec();
    return data;
  }

  //=============================================================
  public hotelById(id: string): Promise<HotelDocument> {
    console.log('SERVISE findOne', id);
    return this.HotelModel.findById(id).exec();
  }

  //=============================================================
  public async create(
    files: any[],
    body: INewHotelBodyDto,
  ): Promise<ICreateHotelDto> {
    // Настройка пути
    const picsFolder = '/public/hotels';
    const folder = join(__dirname, '..', '..', picsFolder);
    // Проверка наличия папки
    try {
      await access(folder);
    } catch (e) {
      await mkdir(folder, { recursive: true });
    }
    // Подготовка массива с файлами
    const resWriteFIles = await Promise.all(
      files.map(async (file) => {
        const fileExtension = file.originalname.split('.')[1];
        // Проверка файла на соответствие
        if (
          !file.mimetype.includes('image') ||
          !['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)
        ) {
          console.log(
            `Файл${file.originalname} не я вляется изображением или имеет не допустимый формат`,
          );
          return;
        }
        const newFileName = `onserv-${uuidv4()}.${fileExtension}`;
        try {
          await writeFile(join(folder, newFileName), file.buffer); // video 3:43 and 2.26
        } catch (error) {
          console.log('ERROR WRITE files', error.message);
        }
        return {
          url: `${picsFolder}/${newFileName}`,
          name: newFileName,
        };
      }),
    );
    const newHotel = {
      title: body.title,
      description: body.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      files: JSON.stringify(resWriteFIles),
    };
    const hotel = this.HotelModel.create(newHotel);
    return hotel;
  }

  public async update(
    id: string,
    files: any[],
    body: IUpdateHotelDto,
  ): Promise<HotelDocument> {
    const picsFolder = '/public/hotels';
    const folder = join(__dirname, '..', '..', picsFolder);
    // Проверка наличия папки
    try {
      await access(folder);
    } catch (e) {
      await mkdir(folder, { recursive: true });
    }
    // Подготовка массива с файлами
    const resWriteFIles = await Promise.all(
      files.map(async (file) => {
        const fileExtension = file.originalname.split('.')[1];
        const fileName = file.originalname.split('.')[0];
        let newFileName: string;
        if (fileName.slice(0, 6) === 'onserv') {
          newFileName = file.originalname;
        } else {
          // Проверка файла на соответствие
          if (
            !file.mimetype.includes('image') ||
            !['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)
          ) {
            console.log(
              `Файл${file.originalname} не я вляется изображением или имеет не допустимый формат`,
            );
            return;
          }

          // Запись файла на сервер
          newFileName = `onserv-${uuidv4()}.${fileExtension}`;
          try {
            await writeFile(join(folder, newFileName), file.buffer); // video 3:43 and 2.26
          } catch (error) {
            console.log('ERROR WRITE files', error.message);
          }
        }

        return {
          url: `${picsFolder}/${newFileName}`,
          name: newFileName,
        };
      }),
    );
    const newHotel = {
      title: body.title,
      description: body.description,
      updatedAt: new Date(),
      files: JSON.stringify(resWriteFIles),
    };

    return this.HotelModel.findOneAndUpdate({ _id: id }, newHotel);
  }

  //=============================================================
  public delete(id: string): Promise<HotelDocument> {
    return this.HotelModel.findOneAndDelete({ _id: id });
  }
}
