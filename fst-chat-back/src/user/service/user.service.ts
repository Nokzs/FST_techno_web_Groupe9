import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from 'src/common/mongoose/inject-model.decorator';
import { User, UserDocument } from '../schema/user.schema';
import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
import type { RegisterUserDto } from '../../auth/DTO/register-user.dto';

const SALT_ROUNDS = 10;

type CreatableUser = Pick<
  RegisterUserDto,
  'pseudo' | 'email' | 'password' | 'language'
>;

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreatableUser): Promise<User> {
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
    return this.userModel.find().lean().exec() as Promise<User[]>;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.userModel.findById(id).lean().exec();
    return (result as User | null) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.userModel.findOne({ email }).lean().exec();
    return (result as User | null) ?? null;
  }

  async updateUser(updateUserDTO: UpdateUserDTO): Promise<User | null> {
    const { id, password, ...userUpdate } = updateUserDTO;
    const updatePayload: Partial<User> = { ...userUpdate };

    if (password) {
      updatePayload.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .lean()
      .exec();

    return (updated as User | null) ?? null;
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
