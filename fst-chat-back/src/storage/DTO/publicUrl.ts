import { ApiProperty } from '@nestjs/swagger';

export class PublicUrlDTO {
  @ApiProperty({
    description: "url d'accès au fichier",
    example: 'https://fst-chat-storage.s3.amazonaws.com/your-file-key',
  })
  publicUrl: string;
}
