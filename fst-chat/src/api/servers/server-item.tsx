import { useState } from "react";
import type { Channel, Server } from "./servers-page";
import { ChannelList } from "../channels/channels-list";
import { can, type AppRole } from "../../utils/roles";

// ðŸ”¹ Composant interne pour un seul serveur
export function ServerItem({ server, role, onRemoved }: { server: Server; role?: AppRole; onRemoved?: (serverId: string) => void }) {
  const [showChannels, setShowChannels] = useState(false);
  const [channels, setChannels] = useState(server.channels || []);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    console.log(newChannel);
    setChannels((prev) => [...prev, newChannel]);
  };
  const handleChannelRemoved = (channelId: string) => {
    setChannels((prev) => prev.filter((c) => c._id !== channelId));
  };

  async function leaveServer(serverId: string) {
    try {
      const res = await fetch(`${API_URL}/servers/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ serverId }),
      });
      if (res.ok) {
        onRemoved?.(serverId);
      } else {
        console.error('Erreur quitter serveur:', await res.text());
      }
    } catch (err) {
      console.error('Erreur quitter serveur:', err);
    }
  }

  async function deleteServer(serverId: string) {
    try {
      const res = await fetch(`${API_URL}/servers/${serverId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        onRemoved?.(serverId);
      } else {
        console.error('Erreur suppression serveur:', await res.text());
      }
    } catch (err) {
      console.error('Erreur suppression serveur:', err);
    }
  }


  return (
    <li
      className="p-4 rounded-2xl shadow-md bg-gray-100 text-gray-900 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleChannels()}
        role="button"
        aria-expanded={showChannels}
      >
        <div>
          <div className="font-semibold text-lg">{server.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {server.description || "Pas de description"}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Membres : {server.members?.length || 0}
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
          {role !== 'CREATOR' && (
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={(e) => { e.stopPropagation(); leaveServer((server._id ?? server.id)!); }}
              title="Quitter ce serveur"
            >
              Quitter
            </button>
          )}
          {can(role, 'CREATOR') && (
          <button
            className="text-red-700 text-sm hover:underline"
            onClick={(e) => { e.stopPropagation(); deleteServer((server._id ?? server.id)!); }}
            title="Supprimer le serveur"
          >
            Supprimer
          </button>
          )}
          <button className="text-gray-500" onClick={(e) => { e.stopPropagation(); toggleChannels(); }} title={showChannels ? "Réduire" : "Dérouler"}>
            {showChannels ? "▼" : "►"}
          </button>
        </div>
      </div>

      {showChannels && (
        <div className="mt-2">
          {loadingChannels ? (
            <div className="text-gray-500 text-sm">
              Chargement des salons...
            </div>
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
    </li>
  );
}
