import { SignedUrlDTO } from '../DTO/SignedUrlDTO';

export interface IStorageProvider {
  SendSignUploadUrl(
    fileName: string,
    eventType: 'profilePicture' | 'messageFile',
    salonId?: string
  ): Promise<SignedUrlDTO>;
  getPublicUrl(
    fileName: string,
    eventType: 'profilePicture' | 'messageFile',
    salonId?: string
  ): string;
  getBucket(
    eventType: 'profilePicture' | 'messageFile',
    salonId?: string
  ): string;
  deleteFile(bucket: string, fileName: string): Promise<void>;
  uploadFile(path: string, file: Buffer, bucket: string): Promise<string>;
  createBucket(bucket: string): void;
  createRoomBucket(roomId: string): void;
}
