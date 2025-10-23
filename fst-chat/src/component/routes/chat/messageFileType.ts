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
  _id: string; // généré par MongoDB dès la création de la version optimistique
  channelId: string;
  receiverId?: User;
  content: string;
  createdAt: string;
  updatedAt: string;
  senderId: User;
  files: MessageFile[];
  replyMessage: Message | null;
  reactions: reaction[];
  sending: boolean; // true tant que le message n'est pas finalisé (upload ou autres)
}
