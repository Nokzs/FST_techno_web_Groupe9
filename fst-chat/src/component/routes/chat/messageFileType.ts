import type { User } from "../../../types/user";
export interface MessageFile {
  originalName: string;
  url?: string;
  mimetype: string;
}
export type reaction = {
  userId: User;
  emoji: string;
};
export interface Message {
  _id: string;
  channelId: string;
  receiverId?: User;
  content: string;
  createdAt: string;
  senderId: User;
  updatedAt: string;
  files: MessageFile[];
  replyMessage: Message | null;
  reactions: reaction[];
}
