import { Controller, UseGuards } from '@nestjs/common';
import { Inject, Body, Req, Post } from '@nestjs/common';
import type { IStorageProvider } from '../provider/IStorageProvider';
import { AuthGuard } from '../../auth/guards/authGuard';
import { JwtPayload } from 'src/auth/types/jwtPayload';
@Controller('/storage')
export class StorageController {
  constructor(
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}
  @UseGuards(AuthGuard)
  @Post('/signedUrl')
  async getSignedUrl(
    @Body() body: { fileName: string; eventType: 'profilePicture' },
    @Req() req: Request
  ): Promise<{ signedUrl: string; filePath: string }> {
    console.log('body', body);
    const payload: JwtPayload = req['user'] as JwtPayload;
    const id = payload.sub;
    const { signedUrl, filePath } = await this.storage.SendSignUploadUrl(
      `${id}/${body.fileName}`,
      body.eventType
    );
    return { signedUrl, filePath };
  }
}
