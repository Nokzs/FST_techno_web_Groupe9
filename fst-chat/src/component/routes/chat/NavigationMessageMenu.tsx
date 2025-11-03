import { Suspense, useEffect, useState } from "react";
import type { Channel, Server,notification } from "../../../api/servers/servers-page";
import { cn } from "../../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavLink,
  useLoaderData,
  type FetcherWithComponents,
} from "react-router";
import { socket } from "../../../socket";
import { useTranslation } from "react-i18next";
import type { MessageLoaderData } from "../../../loaders/messageLoader";

type NavigationMessageMenuProps = {
  channelId: string;
  onSelectChannel?: (channelId: string) => void;
  fetcher: FetcherWithComponents<MessageLoaderData>;
};
type ChannelNotifications = Record<string, notification[]>;
type ServerNotifications = {
  total: number;
  channels: ChannelNotifications;
};
async function fetchAllNotifications(userServers: Server[],userId:string) {
  const notifications: Record<string, ServerNotifications> = {};
  console.log("user",userId)
  const param =  new URLSearchParams({userId})
  const apiUrl = import.meta.env.VITE_API_URL
  await Promise.all(
    userServers.map(async server => {
      // Récupération des channels + notifications pour ce serveur
      const signal = new AbortController().signal
      const userChannel = await fetch(`${apiUrl}/channels/${server._id}?${param.toString()}`, {
        signal,
        credentials: "include",
      }).then((r) => r.json());
      console.log(userChannel)
      const channels: ChannelNotifications = {};
      let total = 0;

      userChannel.forEach((channel: Channel) => {
        const filteredNotif = channel.notification.filter(notif => !notif.seenBy.includes(userId))
        channels[channel._id] = filteredNotif;
        total += filteredNotif.length;
      });

      notifications[server._id] = { total, channels };
    })
  );

  return notifications;
}
 
export function NavigationMessageMenu({
  channelId,
  fetcher,
}: NavigationMessageMenuProps) {

  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { serversData, activeServerData, channelData, userId } = useLoaderData();
  const servers: Server[] = serversData;
   
  const [channels, setChannels] = useState<Channel[]>(channelData);
  
  const [notif, SetNotif] = useState<Record<string, ServerNotifications>> ({});
  const [activeServer, setActiveServer] = useState<Server | null>(
    activeServerData,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [direction, setDirection] = useState(0); // 1 = vers channels, -1 = vers serveurs
  const activeChannel = channelId;

  const refetchChannels = async (signal: AbortSignal) => {
    const channel = await fetch(`${apiUrl}/channels/${activeServer?._id}`, {
      signal,
      credentials: "include",
    }).then((r) => r.json());
    setChannels(channel);

  };
  // Framer Motion pour bascule serveurs ↔ channels
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    }),
  };
  useEffect(() => {
    async function init(){
      const notif = await fetchAllNotifications(serversData,userId)
      SetNotif(notif)    
    }
    init();
   // rejoindre les rooms WebSocket
    serversData.forEach((serverId:Server) => {
      socket.emit("joinServer", serverId._id);
    });
    return ()=>{
      serversData.forEach((serverId:Server) => {  
      socket.emit("leaveServer",serverId._id);
      });
    }
  },[serversData,userId]);

  useEffect(() => {
    if (!activeServer?._id) {
      setChannels([]);
    }else{
      const abortController = new AbortController();
      const signal = abortController.signal;
      refetchChannels(signal) 
      socket.on("updateServer", (updatedServer: string) => {
        if (updatedServer === activeServer?._id) {
          refetchChannels(signal);
        }
      });
    }
    socket.on("newNotification",(newNotif:notification)=>{
      if(newNotif.channelId!== channelId && !newNotif.seenBy.includes(userId)){
        SetNotif(prev => {
          const server = prev[newNotif.serverId] || { total: 0, channels: {} };
          const channelNotifs = server.channels[newNotif.channelId] || [];

          return {
            ...prev,
            [newNotif.serverId]: {
              total: server.total + 1,
              channels: {
                ...server.channels,
                [newNotif.channelId]: [...channelNotifs, newNotif],
              },
            },
          };
        });
      }
    })
    return () => {
      //abortController.abort();
      socket.off("updateServer");
      socket.off("newNotification")
    };
  }, [activeServer, apiUrl,channelId,userId]);

  const handleSelectServer = (server: Server) => {
    setDirection(1);
    setActiveServer(server);
  };

  const handleBackToServers = () => {
    setDirection(-1);
    setActiveServer(null);
  };

  function readNotif(channelId:string,serverId:string): void {
    SetNotif(prev => {
    const server = prev[serverId];
    if (!server) return prev;

    const removedCount = server.channels[channelId]?.length || 0;

    return {
      ...prev,
      [serverId]: {
        total: server.total - removedCount,
        channels: { ...server.channels, [channelId]: [] },
      },
    };
  });    
    socket.emit("read", {
      channelId: channelId, 
      userId,
    });  
  }

  return (
    <div className="flex flex-row items-stretch relative">
      {/* ===== MENU ===== */}
      <motion.div
        animate={{ width: menuOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col bg-white-900 text-white border-r dark:border-2 border-neutral-800 overflow-hidden"
      >
        <div className="relative flex-1 overflow-hidden">
          <Suspense fallback={<div>Chargement...</div>}>
            <AnimatePresence custom={direction} mode="wait">
              {/* === SERVEURS + TITRE ANIMÉ === */}
              {!activeServer && (
                <motion.div
                  key="servers"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col"
                >
                  {/* TITRE */}
                  <div className="flex items-center px-4 py-3 border-b  border-neutral-800">
                    <h2 className="text-black text-lg font-semibold truncate text-center  dark:text-white">
                      {t("tchat.navigationMenu.title")}
                    </h2>
                  </div>

                  {/* LISTE DES SERVEURS */}
                  <div className="flex-1 overflow-y-auto">
                    {servers.length === 0 ? (
                      <p className="text-neutral-500 dark:text-dark text-center mt-5">
                        {t("tchat.navigationMenu.noServer")}
                      </p>
                    ) : (
                      <ul className="space-y-1 mt-2">
                        {servers.map((server) => (
                          <li key={server._id}>
                            <button
                              onClick={() => handleSelectServer(server)}
                              className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-neutral-800 transition"
                            >
                              <span className="truncate whitespace-nowrap text-black dark:text-white">
                                {server.name}
                              </span>
                                {notif[server._id]?.total > 0 && (
                                    <span className="ml-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                                      {notif[server._id]?.total}
                                    </span>
                                  )}                        
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}

              {/* === CHANNELS === */}
              {activeServer && (
                <motion.div
                  key="channels"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                    <button
                      onClick={handleBackToServers}
                      className="hover:bg-neutral-800 p-1 text-black dark:text-white rounded transition"
                      title="Revenir aux serveurs"
                    >
                      {"<<"}
                    </button>
                    <div className="whitespace-nowrap text-black text-center w-full dark:text-white">
                      {activeServer.name.toString().toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {channels.length === 0 ? (
                      <p className="text-neutral-500 text-center mt-5">
                        Aucun salon disponible
                      </p>
                    ) : (
                      <ul className="space-y-1 mt-2">
                          {channels.map((channel:Channel) => (

                            <li key={channel.id}>
                              <NavLink
                                to={`/messages/${channel.serverId}/${channel._id}`}
                                className="truncate"
                                onMouseEnter={() => fetcher.load(`/messages/${channel.serverId}/${channel._id}`)}
                                onMouseDown={()=>readNotif(channel._id,activeServer._id)}
                              >
                                <button
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-neutral-500 dark:hover:bg-neutral-500 text-black dark:text-white transition",
                                    activeChannel === channel._id && "bg-neutral-500"
                                  )}
                                >
                                  <span className="flex-1 truncate">{channel.name}</span>
                                  {/* 🟢 Affichage du badge de notification pour un channel */}
                                  {notif[activeServer._id]?.channels?.[channel._id]?.length > 0 && (
                                    <span className="ml-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                                      {notif[activeServer._id]?.channels?.[channel._id]?.length}
                                    </span>
                                  )}                                
                                </button>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </motion.div>

      {/* ===== BOUTON TOGGLE TOUJOURS VISIBLE ===== */}
      <div className="flex items-start mt-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "p-1 bg-neutral-900 text-white dark:text-black hover:bg-neutral-800 border border-neutral-700 rounded-r-md transition dark:text-white duration-500 text:black",
            menuOpen ? "rotate-z-180 -translate-x-[100%]" : "",
          )}
          title={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
