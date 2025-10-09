export interface IStorageProvider {
  SendSignUploadUrl(
    fileName: string,
    eventType: 'profilePicture'
  ): Promise<{ signedUrl: string; filePath: string }>;
  getPublicUrl(bucket: string, fileName: string): string;
  deleteFile(bucket: string, fileName: string): Promise<void>;
  uploadFile(path: string, file: Buffer, bucket: string): Promise<string>;
}
