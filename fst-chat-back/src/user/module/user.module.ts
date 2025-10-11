import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { User, UserSchema } from '../schema/user.schema';
import { StorageModule } from 'src/storage/storage.module';
import { AuthGuard } from 'src/guards/authGuard';
import { GuardModule } from 'src/guards/guards.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GuardModule,
    StorageModule,
  ],
  controllers: [UserController],
  providers: [UserService, AuthGuard],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
