import type { User } from "../../../types/user";
export interface MessageFile {
  _id?: string;
  originalName: string;
  url: string;
  mimetype: string;
  originalMymeType: string;
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
  updatedAt: string;
  senderId: User;
  files: MessageFile[];
  replyMessage: Message | null;
  reactions: reaction[];
  sending: boolean;
  isDeleted?: boolean;
  isPin: boolean;
}
