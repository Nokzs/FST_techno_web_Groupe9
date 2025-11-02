import type { SetStateAction } from "react";
import type { Message } from "../../types/messageFileType";

export function mergeMessages(
  deltaMessages: Message[],
  setMessages: React.Dispatch<SetStateAction<Message[]>>,
) {
  setMessages((prevMessages) => {
    const messageMap = new Map<string, Message>();

    // 1️⃣ On met tous les anciens messages dans le map
    prevMessages.forEach((msg) => messageMap.set(msg._id, msg));

    // 2️⃣ On applique les nouveaux / modifiés
    deltaMessages.forEach((msg) => messageMap.set(msg._id, msg));

    // 3️⃣ On reconstruit un tableau trié par createdAt
    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });
}
export const fetchSync = async (
  lastSync: string,
  lastMessage: string,
  channelId: string,
): Promise<Message[]> => {
  const params = new URLSearchParams({ channelId, lastSync, lastMessage });
  const API_URL = import.meta.env.API_URL || "http://localhost:3000";
  const data = await fetch(`${API_URL}/messages/sync?${params.toString()}`, {
    credentials: "include",
  });
  const message = await data.json();
  return message;
};
