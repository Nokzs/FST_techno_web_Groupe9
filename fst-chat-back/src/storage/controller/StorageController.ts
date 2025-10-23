import { Controller, UseGuards } from '@nestjs/common';
import { Inject, Body, Req, Post } from '@nestjs/common';
import type { IStorageProvider } from '../provider/IStorageProvider';
import { AuthGuard } from '../../guards/authGuard';
import { JwtPayload } from '../../token/types/jwtPayload';
import { SignedUrlDTO } from '../DTO/SignedUrlDTO';
type eventType = 'profilePicture';
@Controller('/storage')
export class StorageController {
  constructor(
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @UseGuards(AuthGuard)
  @Post('/signedUrl')
  async getSignedUrl(
    @Body() body: { fileName: string; eventType: eventType; salonId?: string },
    @Req() req: Request
  ): Promise<SignedUrlDTO> {
    console.log('body', body);
    const payload: JwtPayload = req['user'] as JwtPayload;
    const id = payload.sub;
    const data = await this.storage.SendSignUploadUrl(
      `${id}/${body.fileName}`,
      body.eventType,
      body.salonId || id
    );
    return data;
  }
}
