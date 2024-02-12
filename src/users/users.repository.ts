import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserDocument } from './models/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class UsersRepository {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(UserDocument.name)
    protected readonly userModel: Model<UserDocument>,
  ) {}

  async create(document: Omit<UserDocument, '_id'>): Promise<UserDocument> {
    const createdDocument = new this.userModel({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createdDocument.save()).toJSON() as unknown as UserDocument;
  }

  async find(filterQuery: FilterQuery<UserDocument>): Promise<UserDocument[]> {
    return this.userModel.find(filterQuery).lean<UserDocument[]>(true);
  }

  async findOne(filterQuery: FilterQuery<UserDocument>): Promise<UserDocument> {
    const document = await this.userModel
      .findOne(filterQuery)
      .lean<UserDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
  ): Promise<UserDocument> {
    const document = await this.userModel
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<UserDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel
      .findOneAndDelete(filterQuery)
      .lean<UserDocument>(true);
  }
}
