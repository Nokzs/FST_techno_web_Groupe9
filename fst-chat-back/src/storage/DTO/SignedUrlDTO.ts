import { ApiProperty } from '@nestjs/swagger';

export class SignedUrlDTO {
  @ApiProperty({
    description:
      'URL signée pour accéder au fichier stocké de manière sécurisée',
    example:
      'https://fst-chat-storage.s3.amazonaws.com/your-signed-url?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...',
  })
  signedUrl: string;

  @ApiProperty({
    description: "token d'accès pour le téléchargement ou l'upload du fichier",
  })
  token: string;

  @ApiProperty({
    description: 'chemin du fichier dans le stockage',
  })
  path: string;
}
