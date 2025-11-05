import { useState } from "react";
import type { Channel, Server } from "./servers-page";
import { ChannelList } from "../channels/channels-list";
import { can, type AppRole } from "../../utils/roles";
import { useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { ServerModal } from "../../component/routes/servers/ServerModal";

// ðŸ”¹ Composant interne pour un seul serveur
export function ServerItem({
  server,
  role,
  onRemoved,
}: {
  server: Server;
  role?: AppRole;
  onRemoved?: (serverId: string) => void;
}) {
  const [showChannels, setShowChannels] = useState(false);
  const [channels, setChannels] = useState(server.channels || []);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isPublic, setIsPublic] = useState(server.isPublic || false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const currentUser = useOutletContext<{ id: string }>(); // LoaderData renvoyant l’utilisateur actuel
  const { t } = useTranslation();

  const inviteCode = server.inviteCode as string | undefined;

  const copyInvite = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch (e) {
      console.error("Impossible de copier le code", e);
    }
  };
  const toggleChannels = async () => {
    if (!showChannels && channels.length === 0) {
      setLoadingChannels(true);
      try {
        const sid = server._id ?? server.id;
        const res = await fetch(`${API_URL}/channels/${sid}`, {
          credentials: "include",
        });
        const data = await res.json();
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur rÃ©cupÃ©ration channels :", err);
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
  const handleChannelRemoved = (channelId: string) => {
    setChannels((prev) => prev.filter((c) => c._id !== channelId));
  };

  async function leaveServer(serverId: string) {
    try {
      const res = await fetch(`${API_URL}/servers/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ serverId }),
      });
      if (res.ok) {
        onRemoved?.(serverId);
      } else {
        console.error("Erreur quitter serveur:", await res.text());
      }
    } catch (err) {
      console.error("Erreur quitter serveur:", err);
    }
  }

  async function deleteServer(serverId: string) {
    try {
      const res = await fetch(`${API_URL}/servers/${serverId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        onRemoved?.(serverId);
      } else {
        console.error("Erreur suppression serveur:", await res.text());
      }
    } catch (err) {
      console.error("Erreur suppression serveur:", err);
    }
  }

  return (
    <li className="w-[98%] max-w-full p-4 rounded-2xl shadow-md  dark:bg-gray-100 text-gray-900 border border-gray-200 transition-transform duration-200 transform hover:shadow-lg  origin-center">
      {/* Titre et bascule channels */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleChannels()}
        role="button"
        aria-expanded={showChannels}
      >
        <div>
          <div className="font-semibold text-lg">{server.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {server.description || t("server.nodescription")}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {t("server.member")}: {server.members?.length ?? 0}
          </div>
          {inviteCode && (
            <div className="text-xs text-gray-600 mt-2 flex items-center gap-2">
              <span>Code d'invitation :</span>
              <code className="px-2 py-0.5 bg-gray-200 rounded text-gray-900">
                {inviteCode}
              </code>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyInvite();
                }}
                className="text-blue-600 hover:underline"
                title="Copier le code"
              >
                Copier
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {role !== "CREATOR" && (
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                leaveServer((server._id ?? server.id)!);
              }}
              title="Quitter ce serveur"
            >
              {t("server.leave")}
            </button>
          )}
          {can(role, "CREATOR") && (
            <button
              className="text-red-700 text-sm hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                deleteServer((server._id ?? server.id)!);
              }}
              title="Supprimer le serveur"
            >
              Supprimer
            </button>
          )}
          <button
            className="text-gray-500"
            onClick={(e) => {
              e.stopPropagation();
              toggleChannels();
            }}
            title={showChannels ? "Réduire" : "Dérouler"}
          >
            {showChannels ? "▼" : "►"}
          </button>
        </div>
      </div>

      {/* Liste des channels */}
      {showChannels && (
        <div className="mt-2">
          {loadingChannels ? (
            <div className="text-gray-500 text-sm">{t("room.loading")}</div>
          ) : (
            <ChannelList
              serverId={(server._id ?? server.id)!}
              channels={channels}
              onChannelAdded={handleChannelAdded}
              onChannelRemoved={handleChannelRemoved}
              role={role}
            />
          )}
        </div>
      )}

      {/* Bouton pour ouvrir la modal */}
      {can(role, "CREATOR") && (
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
