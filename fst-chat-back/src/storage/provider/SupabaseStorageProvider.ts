import { IStorageProvider } from './IStorageProvider';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { TYPE_EVENT } from '../typeEvent';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

  async SendSignUploadUrl(
    fileName: string,
    eventType: 'profilePicture'
  ): Promise<{ signedUrl: string; filePath: string }> {
    console.log(TYPE_EVENT[eventType]);
    const { data, error } = await this.supabaseClient.storage
      .from('fstChatProfilPictureBucket')
      .createSignedUploadUrl(fileName);

    if (error) {
      throw new Error(
        `${error.name} : Failed to create signed upload URL: ${error.message}`
      );
    }

    if (!data || !data.signedUrl) {
      throw new Error('No signed URL returned by Supabase');
    }

    return { signedUrl: data.signedUrl, filePath: fileName };
  }
  getPublicUrl(bucket: string, fileName: string): string {
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
}
