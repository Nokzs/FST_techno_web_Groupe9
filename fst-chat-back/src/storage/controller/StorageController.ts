import { Controller, UseGuards, Logger } from '@nestjs/common';
import { Inject, Body, Req, Post } from '@nestjs/common';
import type { IStorageProvider } from '../provider/IStorageProvider';
import { AuthGuard } from '../../guards/authGuard';
import { JwtPayload } from '../../token/types/jwtPayload';
import { SignedUrlDTO } from '../DTO/SignedUrlDTO';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
type eventType = 'profilePicture';
@Controller('/storage')
export class StorageController {
  constructor(
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @ApiOperation({
    description:
      "demande une urlSigné afin d'upload un fichier de profile ou d'envoie de fichier sur le chat",
  })
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  @UseGuards(AuthGuard)
  @Post('/signedUrl')
  async getSignedUrl(
    @Body() body: { fileName: string; eventType: eventType; salonId?: string },
    @Req() req: Request
  ): Promise<SignedUrlDTO> {
    console.log('body', body);
    const payload: JwtPayload = req['user'] as JwtPayload;
    const id = payload.sub;
    const effectID = body.salonId ? body.salonId : id;
    const data = await this.storage.SendSignUploadUrl(
      `${id}/${body.fileName}`,
      body.eventType,
      effectID
    );
    return data;
  }
}
