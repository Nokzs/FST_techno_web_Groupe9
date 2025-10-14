import { IStorageProvider } from './IStorageProvider';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { TYPE_EVENT } from '../typeEvent';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SignedUrlDTO } from '../DTO/SignedUrlDTO';

@Injectable()
export class SupabaseStorageProvider implements IStorageProvider {
  supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    console.log(supabaseUrl, supabaseKey);
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase URL or Key is not defined in environment variables'
      );
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  getBucket(
    eventType: 'profilePicture' | 'messageFile',
    salonId?: string
  ): string {
    if (eventType === 'messageFile') {
      if (!salonId)
        throw new Error('Salon ID requis pour les images de message');
      console.log('bucket', TYPE_EVENT[eventType].bucket + salonId);
      return TYPE_EVENT[eventType].bucket + salonId;
    }
    return TYPE_EVENT[eventType].bucket;
  }

  async SendSignUploadUrl(
    fileName: string,
    eventType: 'profilePicture' | 'messageFile',
    salonId?: string
  ): Promise<SignedUrlDTO> {
    const bucket = this.getBucket(eventType, salonId);
    const { data, error } = await this.supabaseClient.storage
      .from(bucket)
      .createSignedUploadUrl(fileName, {
        upsert: true,
      });

    if (error) {
      throw new Error(
        `${error.name} : Failed to create signed upload URL: ${error.message}`
      );
    }

    if (!data || !data.signedUrl) {
      throw new Error('No signed URL returned by Supabase');
    }

    return data;
  }
  getPublicUrl(
    fileName: string,
    eventType: 'profilePicture' | 'messageFile',
    salonId?: string
  ): string {
    const bucket: string = this.getBucket(eventType, salonId);
    Logger.log(`Getting public URL from bucket: ${bucket}`);
    Logger.log(`File name: ${fileName}`);
    const { data } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(fileName);
    return data.publicUrl;
  }
  async deleteFile(bucket: string, fileName: string): Promise<any> {
    return this.supabaseClient.storage
      .from(bucket)
      .remove([fileName])
      .catch((error) => {
        throw error;
      });
  }

  async uploadFile(
    path: string,
    file: Buffer,
    bucket: string
  ): Promise<string> {
    const { error } = await this.supabaseClient.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;

    const { data } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
  async createRoomBucket(roomId: string) {
    this.supabaseClient.storage.createBucket(
      `fstChatMessageFileBucket${roomId}`,
      { public: true }
    );
  }
}
