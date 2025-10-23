import { Suspense, useEffect, useState } from "react";
import type { Channel, Server } from "../../../api/servers/servers-page";
import { cn } from "../../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLoaderData } from "react-router";
import { socket } from "../../../socket";
import { useTranslation } from "react-i18next";
type NavigationMessageMenuProps = {
  channelId?: string;
  onSelectChannel?: (channelId: string) => void;
};

export function NavigationMessageMenu({
  channelId,
}: NavigationMessageMenuProps) {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { serversData, activeServerData, channelData } = useLoaderData();
  console.log("Loader data dans NavigationMessageMenu :", {
    serversData,
    activeServerData,
    channelData,
  });
  const servers: Server[] = serversData;
  const [channels, setChannels] = useState<Channel[]>(channelData);
  const [activeServer, setActiveServer] = useState<Server | null>(
    activeServerData,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [direction, setDirection] = useState(0); // 1 = vers channels, -1 = vers serveurs
  const activeChannel = channelId;
  const refetchChannels = async () => {
    const channel = await fetch(`${apiUrl}/channels/${activeServer?._id}`, {
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
    if (!activeServer?._id) {
      setChannels([]);
      return;
    }

    fetch(`${apiUrl}/channels/${activeServer._id}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setChannels);
    socket.emit("joinServer", activeServer._id);
    socket.on("updateServer", (updatedServer: string) => {
      if (updatedServer === activeServer._id) {
        refetchChannels();
      }
    });
  }, [activeServer]);

  const handleSelectServer = (server: Server) => {
    setDirection(1);
    setActiveServer(server);
  };

  const handleBackToServers = () => {
    setDirection(-1);
    setActiveServer(null);
  };

  return (
    <div className="flex flex-row items-stretch relative">
      {/* ===== MENU ===== */}
      <motion.div
        animate={{ width: menuOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col bg-neutral-900 text-white border-r border-neutral-800 overflow-hidden"
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
                  <div className="flex items-center px-4 py-3 border-b border-neutral-800">
                    <h2 className="text-lg font-semibold truncate">
                      {t("tchat.navigationMenu.title")}
                    </h2>
                  </div>

                  {/* LISTE DES SERVEURS */}
                  <div className="flex-1 overflow-y-auto">
                    {servers.length === 0 ? (
                      <p className="text-neutral-500 text-center mt-5">
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
                              <span className="truncate whitespace-nowrap">
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
                      className="hover:bg-neutral-800 p-1 rounded transition"
                      title="Revenir aux serveurs"
                    >
                      {"<<"}
                    </button>
                    <div className="whitespace-nowrap">
                      {activeServer.name.toString()}
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
                              replace
                              className="truncate"
                            >
                              <button
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-neutral-800 transition",
                                  activeChannel === channel._id &&
                                    "bg-neutral-800",
                                )}
                              >
                                {channel.name}
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
            "p-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-r-md transition dark:text-white duration-500 text:black",
            menuOpen ? "rotate-z-180" : "",
          )}
          title={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
