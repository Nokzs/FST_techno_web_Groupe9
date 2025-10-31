import { IStorageProvider } from './IStorageProvider';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
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

  getBucket(eventType: 'profilePicture' | 'messageFile', Id?: string): string {
    if (!Id) throw new Error('id requis');
    return TYPE_EVENT[eventType].bucket + Id;
  }

  async SendSignUploadUrl(
    fileName: string,
    eventType: 'profilePicture' | 'messageFile',
    id?: string
  ): Promise<SignedUrlDTO> {
    const bucket = this.getBucket(eventType, id);
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
    const { data, error } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(fileName);
    if (error || !data.publicUrl) {
      throw new Error("impossible de récupérer l'url publique");
    }
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
  createBucket(bucket: string) {
    this.supabaseClient.storage
      .createBucket(bucket, { public: true })
      .catch((error) => {
        throw error;
      });
  }
  async createRoomBucket(roomId: string): Promise<void> {
    await this.supabaseClient.storage
      .createBucket(`fstChatMessageFileBucket${roomId}`, { public: true })
      .catch((error) => {
        throw error;
      });
  }
}
