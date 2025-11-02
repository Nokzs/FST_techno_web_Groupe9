import { useState } from "react";
import { createPortal } from "react-dom";
import type { Channel, Server } from "./servers-page";
import { ChannelList } from "../channels/channels-list";
import { useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { ServerModal } from "../../component/routes/servers/ServerModal";

export function ServerItem({ server }: { server: Server }) {
  const [showChannels, setShowChannels] = useState(false);
  const [channels, setChannels] = useState(server.channels || []);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isPublic, setIsPublic] = useState(server.isPublic || false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const currentUser = useOutletContext<{ id: string }>(); // LoaderData renvoyant l’utilisateur actuel
  const { t } = useTranslation();
  const toggleChannels = async () => {
    if (!showChannels && channels.length === 0) {
      setLoadingChannels(true);
      try {
        const res = await fetch(`${API_URL}/channels/${server._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur récupération channels :", err);
      } finally {
        setLoadingChannels(false);
      }
    }
    setShowChannels((prev) => !prev);
  };

  const handleChannelAdded = (newChannel: Channel) => {
    setChannels((prev) => [...prev, newChannel]);
  };

  const isOwner = currentUser?.id === server.ownerId;

  const handleOpenServer = async (tags: string) => {
    console.log("Ouverture serveur", server);
    const splitTags = tags.split(",").map((t) => t.trim());
    try {
      const res = await fetch(`${API_URL}/servers/open`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: server._id,
          isPublic: true,
          tags: splitTags,
        }),
      });
      if (!res.ok) throw new Error("Impossible d'ouvrir le serveur");
      setIsPublic(true);
      setShowModal(false);
      server.tags = splitTags;
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseServer = async () => {
    try {
      const res = await fetch(`${API_URL}/servers/close`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ serverId: server._id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Impossible de fermer le serveur");
      setIsPublic(false);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <li className="w-[98%] max-w-full p-4 rounded-2xl shadow-md  dark:bg-gray-100 text-gray-900 border border-gray-200 transition-transform duration-200 transform hover:shadow-lg hover:scale-[1.02] origin-center">
      {/* Titre et bascule channels */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleChannels}
      >
        <div>
          <div className="font-semibold text-lg">{server.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {server.description || t("server.nodescription")}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {t("server.member")}: {server.members?.length ?? 0}
          </div>
        </div>
        <div className="text-gray-500">{showChannels ? "▲" : "▼"}</div>
      </div>

      {/* Liste des channels */}
      {showChannels && (
        <div className="mt-2">
          {loadingChannels ? (
            <div className="text-gray-500 text-sm">{t("room.loading")}</div>
          ) : (
            <ChannelList
              serverId={server._id}
              channels={channels}
              onChannelAdded={handleChannelAdded}
            />
          )}
        </div>
      )}

      {/* Bouton pour ouvrir la modal */}
      {isOwner && (
        <button
          className={`mt-4 px-3 py-1 rounded text-white ${
            isPublic
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={() => setShowModal(true)}
        >
          {isPublic ? t("room.updateClose") : t("room.open")}
        </button>
      )}

      {/* Affichage public */}
      {isPublic && isOwner && (
        <div className="mt-2 text-sm text-green-700 font-medium">
          {t("room.openToPublic")}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ServerModal
          server={server}
          isPublic={isPublic}
          setShowModal={setShowModal}
          handleCloseServer={handleCloseServer}
          handleOpenServer={handleOpenServer}
        />
      )}
    </li>
  );
}
