import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerController } from '../controller/server.controller';
import { ServerService } from '../service/server.service';
import { Server, ServerSchema } from '../schema/server.schema';
import { AuthModule } from 'src/auth/module/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    AuthModule,
  ],
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerService],
})
export class ServerModule {}
