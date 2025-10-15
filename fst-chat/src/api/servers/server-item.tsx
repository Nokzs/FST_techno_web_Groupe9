import { useState } from "react";
import type { Channel, Server } from "./servers-page";
import { ChannelList } from "../channels/channels-list";

// 🔹 Composant interne pour un seul serveur
export function ServerItem({ server }: { server: Server }) {
  const [showChannels, setShowChannels] = useState(false);
  const [channels, setChannels] = useState(server.channels || []);
  const [loadingChannels, setLoadingChannels] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
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

  // quand un channel est créé depuis le formulaire
  const handleChannelAdded = (newChannel: Channel) => {
    setChannels((prev) => [...prev, newChannel]);
  };

  return (
    <li className="p-4 rounded-2xl shadow-md bg-gray-100 text-gray-900 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-transform duration-200">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleChannels}>
        <div>
          <div className="font-semibold text-lg">{server.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {server.description || "Pas de description"}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Membres : {server.members?.length || 0}
          </div>
        </div>
        <div className="text-gray-500">{showChannels ? "▲" : "▼"}</div>
      </div>

      {showChannels && (
        <div className="mt-2">
          {loadingChannels ? (
            <div className="text-gray-500 text-sm">Chargement des salons...</div>
          ) : (
            <ChannelList
              serverId={server._id}
              channels={channels}
              onChannelAdded={handleChannelAdded}
            />
          )}
        </div>
      )}
    </li>
  );
}
