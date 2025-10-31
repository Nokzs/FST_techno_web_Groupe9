import { Suspense, useEffect, useState } from "react";
import type { Channel, Server } from "../../../api/servers/servers-page";
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
import type { notification } from "../../../api/servers/servers-page";
type NavigationMessageMenuProps = {
  channelId: string;
  onSelectChannel?: (channelId: string) => void;
  fetcher: FetcherWithComponents<MessageLoaderData>;
};



  const computeNotif = (channels:Channel[],userId:string,channelId:string):Record<string,notification[]> =>{
   return channels.reduce((acc, channel) => {
      if(channel._id !== channelId){
        acc[channel._id] = channel.notification.filter((notif:notification) => !notif.seenBy.includes(userId));
      }
      return acc;
    }, {} as Record<string, notification[]>);
   
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
  const [notif,SetNotif] = useState<Record<string,notification[]>>(computeNotif(channelData,userId,channelId))
  const [activeServer, setActiveServer] = useState<Server | null>(
    activeServerData,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [direction, setDirection] = useState(0); // 1 = vers channels, -1 = vers serveurs
  const activeChannel = channelId;

  const refetchChannels = async (signal: AbortSignal,channelId:string) => {
    const channel = await fetch(`${apiUrl}/channels/${activeServer?._id}`, {
      signal,
      credentials: "include",
    }).then((r) => r.json());
    console.log(channel)
    setChannels(channel);
    SetNotif(computeNotif(channel,userId,channelId))

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
    if (!activeServer?._id) {
      setChannels([]);
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    refetchChannels(signal,channelId) 
    socket.emit("joinServer", activeServer._id);
    socket.on("updateServer", (updatedServer: string) => {
      console.log("j'ai recu une update")
      if (updatedServer === activeServer._id) {
        refetchChannels(signal,channelId);
      }
    });
    socket.on("newNotification",(newNotif:notification)=>{
      
      if(newNotif.channelId!== channelId){
        SetNotif((notif) => ({
          ...notif,
          [newNotif.channelId]: [...(notif[newNotif.channelId] || []), newNotif],
        }));
      }
      else{
        console.log("j'ignore")
      }
    })
    return () => {
      //abortController.abort();
      socket.emit("leaveServer");
      socket.off("updateServer");
      socket.off("newNotification")
    };
  }, [activeServer, apiUrl,channelId]);

  const handleSelectServer = (server: Server) => {
    setDirection(1);
    setActiveServer(server);
  };

  const handleBackToServers = () => {
    setDirection(-1);
    setActiveServer(null);
  };

  function readNotif(channelId:string): void {
    SetNotif((prev) => ({
      ...prev,
      [channelId]: [],
    }));
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
                          {channels.map((channel) => (
                            <li key={channel._id}>
                              <NavLink
                                to={`/messages/${channel._id}`}
                                className="truncate"
                                onMouseEnter={() => fetcher.load(`/messages/${channel._id}`)}
                                onMouseDown={()=>readNotif(channel._id)}
                              >
                                <button
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-neutral-500 dark:hover:bg-neutral-500 text-black dark:text-white transition",
                                    activeChannel === channel._id && "bg-neutral-500"
                                  )}
                                >
                                  <span className="flex-1 truncate">{channel.name}</span>

                                  {/* 🟢 Affichage du badge de notification */}
                                  {notif?.[channel._id]?.length > 0 && (
                                    <span className="ml-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                                      {notif[channel._id].length}
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
