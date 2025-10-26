import { redirect, type LoaderFunction } from "react-router-dom";
import type { Server, Channel } from "../api/servers/servers-page.js";
import type { messageBotType } from "../component/ui/ChatBotWindows.js";
export type MessageLoaderData = {
  serversData: Server[];
  activeServerData: Server;
  channelData?: Channel[];
  tchatBotData?: messageBotType[];
};
export const messageLoader: LoaderFunction = async (
  data,
): Promise<MessageLoaderData> => {
  const { channelId } = data.params;
  console.log("channelId dans le loader :", channelId);
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

  const localMessages = localStorage.getItem("botMessages");
  const tchatBotData = localMessages
    ? JSON.parse(localMessages)
    : [
        {
          from: "bot",
          text: "Salut 👋, voici les commandes que tu peux utiliser \n -/question suivi de ta question sur la discussion de ce channel",
        },
      ];
  return {
    serversData: servers,
    activeServerData: activeServer.serverId,
    channelData: channel,
    tchatBotData: tchatBotData,
  };
};
