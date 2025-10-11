import { SignedUrlDTO } from '../DTO/SignedUrlDTO';

export interface IStorageProvider {
  SendSignUploadUrl(
    fileName: string,
    eventType: 'profilePicture'
  ): Promise<SignedUrlDTO>;
  getPublicUrl(bucket: string, fileName: string): string;
  deleteFile(bucket: string, fileName: string): Promise<void>;
  uploadFile(path: string, file: Buffer, bucket: string): Promise<string>;
}
