import { redirect, type LoaderFunction } from "react-router-dom";
import type { Server, Channel } from "../api/servers/servers-page.js";
import type { messageBotType } from "../component/ui/ChatBotWindows.js";
import { fileCache, avatarCache } from "../cache/fileCache.js";
import type { Message, MessageFile } from "../types/messageFileType";
import { gunzipSync } from "fflate";
import type { UserID } from "../types/user.js";
import { authRouterContext } from "../context/authRouterContext.js";
import { messages } from "../assets/exportData.js";
const fetchPinnedMessages = async (channelId: string): Promise<Message[]> => {
  try {
    const params = new URLSearchParams({ channelId });
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const response = await fetch(
      `${API_URL}/messages/pinned?${params.toString()}`,
      { credentials: "include" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages: Message[] = await response.json();

    return messages;
  } catch (error) {
    console.error("Error fetching pinned messages:", error);
    throw error;
  }
};
export const fetchMessages = async (channelId: string, date: string) => {
  try {
    const params = new URLSearchParams({
      channelId,
      date, // pas de date pour le fetch initial
    });
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const response = await fetch(`${API_URL}/messages?${params.toString()}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { messages: Message[]; hasMore: boolean } =
      await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
const fetchInitialMessages = async (
  channelId: string,
): Promise<{
  messagesArr: Message[];
  InitialHasMore: boolean;
}> => {
  try {
    const data: { messages: Message[]; hasMore: boolean } = await fetchMessages(
      channelId,
      "",
    );
    // On prend les premiers messages visibles
    const visibleMessages: Message[] = data.messages.slice(0, 10);

    // Décompression des fichiers et avatars
    for (const msg of visibleMessages) {
      if (msg.files?.length) {
        const decompressedFiles = await Promise.all(
          msg.files.map(decompressMessageFile),
        );
        msg.files = decompressedFiles;
      }

      if (msg.senderId.urlPicture) {
        await decompressAvatar(msg.senderId.urlPicture);
      }
    }

    return { messagesArr: data.messages, InitialHasMore: data.hasMore };
  } catch (error) {
    console.error("Error fetching initial messages:", error);
    throw error;
  }
};
async function decompressAvatar(url?: string): Promise<void> {
  if (!url) return undefined;

  if (avatarCache.has(url)) return;

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "image/*" });
    avatarCache.set(url, blob);
  } catch (err) {
    console.error("Erreur chargement avatar :", err);
  }
}

export async function decompressMessageFile(
  file: MessageFile,
): Promise<MessageFile> {
  try {
    // On récupère le fichier compressé
    let fileUrl = fileCache.get(file._id || "");
    const nameWithoutGz = file.originalName.replace(/\.gz$/, "");
    if (!file.originalMymeType) {
      return file;
    }
    if (!fileUrl) {
      const compressedData = await fetch(file.url)
        .then((res) => res.arrayBuffer())
        .then((buf) => new Uint8Array(buf));

      // Décompression avec fflate
      const decompressed = gunzipSync(compressedData);

      const blob = new Blob([decompressed], {
        type: file.originalMymeType || file.mimetype || "image/",
      });
      fileUrl = URL.createObjectURL(blob);
      fileCache.set(file._id || "", fileUrl);
    }

    return {
      ...file,
      url: fileUrl,
      originalName: nameWithoutGz,
      mimetype: file.originalMymeType,
    };
  } catch (err) {
    console.error("Erreur de décompression du fichier :", file, err);
    return file; // fallback
  }
}
export type MessageLoaderData = {
  channelId: string;
  serversData: Server[];
  activeServerData: Server;
  channelData?: Channel[];
  tchatBotData?: messageBotType[];
  hasMore: boolean;
  messagesArr: Message[];
  userId: string;
  pinnedMessages: Message[];
};
export const messageLoader: LoaderFunction = async (
  data,
): Promise<MessageLoaderData> => {
  const userID: UserID | null = data.context.get(authRouterContext);
  if (!userID) {
    throw redirect("/login");
  }
  const { channelId } = data.params;
  if (!channelId) {
    throw redirect("/servers");
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  const servers = await fetch(`${apiUrl}/servers`, {
    credentials: "include",
  }).then((r) => r.json());

  const activeServer = await fetch(`${apiUrl}/channels/channel/${channelId}`, {
    credentials: "include",
  }).then((r) => {
    if (r.status === 404) {
      redirect("/servers");
    }
    return r.json();
  });

  const channel = await fetch(
    `${apiUrl}/channels/${activeServer.serverId._id}`,
    {
      credentials: "include",
    },
  ).then((r) => r.json());

  const localMessages = localStorage.getItem("botMessages" + channelId);
  const tchatBotData = localMessages
    ? JSON.parse(localMessages)
    : [
        {
          from: "bot",
          custom: false,
          text: "chatBot.welcomeMessage",
        },
      ];

  // initiliasation des messages
  /* const { messagesArr, InitialHasMore } = await new Promise<{
    messagesArr: Message[];
    InitialHasMore: boolean;
  }>((resolve, reject) => {
    socket.emit(
      "getMessages",
      { channelId, date: null },
      async ({
        messages,
        hasMore,
      }: {
        messages: Message[];
        hasMore: boolean;
      }) => {
        const visibleMessages: Message[] = messages.slice(0, 10);
        for (const msg of visibleMessages) {
          if (msg.files?.length) {
            const decompressedFiles = await Promise.all(
              msg.files.map(decompressMessageFile),
            );
            msg.files = decompressedFiles;
          }

          if (msg.senderId.urlPicture) {
            await decompressAvatar(msg.senderId.urlPicture);
          }
        }
        resolve({ messagesArr: messages, InitialHasMore: hasMore });
      },
    );

    // Optionnel : si le serveur ne répond pas après 5s
    setTimeout(() => reject(new Error("Socket timeout")), 10000);
  }); */
  const { messagesArr, InitialHasMore } = await fetchInitialMessages(channelId);
  // initiliasation des messages
  /* const messagesPinnedArr = await new Promise<Message[]>((resolve, reject) => {
    socket.emit("getPinnedMessages", channelId, (messages: Message[]) => {
      resolve(messages);
    });

    // Optionnel : si le serveur ne répond pas après 5s
    setTimeout(() => reject(new Error("Socket timeout")), 10000);
  });*/
  const messagesPinnedArr = await fetchPinnedMessages(channelId);
  return {
    channelId,
    serversData: servers,
    activeServerData: activeServer.serverId,
    channelData: channel,
    tchatBotData: tchatBotData,
    hasMore: InitialHasMore,
    messagesArr: messagesArr,
    userId: userID.id,
    pinnedMessages: messagesPinnedArr,
  };
};
