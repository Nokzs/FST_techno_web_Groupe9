export interface MessageFile {
  originalName: string; // nom original
  url?: string; // URL signée ou publique
  mimetype: string; // image/png, application/pdf, video/mp4...
}
export interface Message {
  channelId: string;
  content: string;
  createdAt: string;
  senderId: string;
  updatedAt: string;
  files: MessageFile[];
}
