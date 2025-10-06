import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
import { RegisterUserDto } from '../DTO/register-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS
    );
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isAdmin: false,
    });
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUser(updateUserDTO: UpdateUserDTO): Promise<User | null> {
    const { id, password, ...userUpdate } = updateUserDTO;
    const updatePayload: Partial<User> = { ...userUpdate };

    if (password) {
      updatePayload.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    return this.userModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();
  }

  async setLastConnection(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastConnectedAt: new Date() })
      .exec();
  }

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
