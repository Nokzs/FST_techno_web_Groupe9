import { redirect, type LoaderFunction } from "react-router-dom";
import type { Server, Channel } from "../api/servers/servers-page.js";
import type { messageBotType } from "../component/ui/ChatBotWindows.js";
import { socket } from "../socket.js";
import { fileCache } from "../cache/fileCache.js";
import type {
  Message,
  MessageFile,
} from "../component/routes/chat/messageFileType.js";
import { gunzipSync } from "fflate";
export async function decompressMessageFile(
  file: MessageFile,
): Promise<MessageFile> {
  try {
    // On récupère le fichier compressé
    let fileUrl = fileCache.get(file._id);
    const nameWithoutGz = file.originalName.replace(/\.gz$/, "");

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
      fileCache.set(file._id, fileUrl);
    }

    return {
      ...file,
      url: fileUrl,
      originalName: nameWithoutGz,
      mimetype: file.originalMymeType,
    };
  } catch (err) {
    console.error("Erreur de décompression du fichier :", file.url, err);
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
};
export const messageLoader: LoaderFunction = async (
  data,
): Promise<MessageLoaderData> => {
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
          text: "Salut 👋, voici les commandes que tu peux utiliser \n -/question suivi de ta question sur la discussion de ce channel",
        },
      ];
  // initiliasation des messages
  const { messagesArr, InitialHasMore } = await new Promise<{
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
        const visibleMessages: Message[] = messages.slice(0, 5);
        for (const msg of visibleMessages) {
          if (msg.files?.length) {
            const decompressedFiles = await Promise.all(
              msg.files.map(decompressMessageFile),
            );
            msg.files = decompressedFiles;
          }
        }
        resolve({ messagesArr: messages, InitialHasMore: hasMore });
      },
    );

    // Optionnel : si le serveur ne répond pas après 5s
    setTimeout(() => reject(new Error("Socket timeout")), 10000);
  });

  return {
    channelId,
    serversData: servers,
    activeServerData: activeServer.serverId,
    channelData: channel,
    tchatBotData: tchatBotData,
    hasMore: InitialHasMore,
    messagesArr: messagesArr,
  };
};
