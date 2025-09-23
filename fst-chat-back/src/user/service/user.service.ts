import { Injectable } from '@nestjs/common';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDTO } from '../DTO/CreateUserDTO';
import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDTO): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
  async updateUser(updateUserDTO: UpdateUserDTO): Promise<User | null> {
    const { id, ...userUpdate } = updateUserDTO;
    const user = await this.userModel
      .findOneAndUpdate({ id }, userUpdate)
      .exec();
    return user?.save() ?? null;
    //return user;
  }
}
