import { ApiProperty } from '@nestjs/swagger';

export class PublicUrlDTO {
  @ApiProperty({
    description: 'rolepar défaut des nouveaux membres',
    example: 'https://fst-chat-storage.s3.amazonaws.com/your-file-key',
  })
  publicUrl: string;
}
