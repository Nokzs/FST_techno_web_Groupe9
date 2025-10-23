import { redirect, type LoaderFunction } from "react-router-dom";
import type { Server, Channel } from "../api/servers/servers-page.js";

export type MessageLoaderData = {
  serversData: Server[];
  activeServerData: Server;
  channelData?: Channel[];
};
export const messageLoader: LoaderFunction = async (data) => {
  console.log(data);
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

  return {
    serversData: servers,
    activeServerData: activeServer.serverId,
    channelData: channel,
  };
};
