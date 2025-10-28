import { useState } from "react";
import { createPortal } from "react-dom";
import type { Channel, Server } from "./servers-page";
import { ChannelList } from "../channels/channels-list";
import { useOutletContext } from "react-router";

export function ServerItem({ server }: { server: Server }) {
  const [showChannels, setShowChannels] = useState(false);
  const [channels, setChannels] = useState(server.channels || []);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [tags, setTags] = useState(server.tags?.join(", ") || "");
  const [isPublic, setIsPublic] = useState(server.isPublic || false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const currentUser = useOutletContext<{ id: string }>(); // LoaderData renvoyant l’utilisateur actuel

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

  const handleOpenServer = async () => {
    try {
      const res = await fetch(`${API_URL}/servers/open`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId:server._id,
          isPublic: true,
          tags: tags.split(",").map((t) => t.trim()),
        }),
      });
      if (!res.ok) throw new Error("Impossible d'ouvrir le serveur");
      setIsPublic(true);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseServer = async () => {
    try {
      const res = await fetch(`${API_URL}/servers/${server._id}/close`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de fermer le serveur");
      setIsPublic(false);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <li className="w-[98%] max-w-full p-4 rounded-2xl shadow-md bg-gray-100 text-gray-900 border border-gray-200 transition-transform duration-200 transform hover:shadow-lg hover:scale-[1.02] origin-center">
      {/* Titre et bascule channels */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleChannels}
      >
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

      {/* Liste des channels */}
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

      {/* Bouton pour ouvrir la modal */}
      {isOwner && (
        <button
          className={`mt-4 px-3 py-1 rounded text-white ${
            isPublic ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={() => setShowModal(true)}
        >
          {isPublic ? "Modifier / Fermer le serveur" : "Ouvrir le serveur"}
        </button>
      )}

      {/* Affichage public */}
      {isPublic && (
        <div className="mt-2 text-sm text-green-700 font-medium">
          Serveur ouvert au public
        </div>
      )}

      {/* Modal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Fond semi-transparent + blur */}
            <div
              className="absolute inset-0 bg-black opacity-40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
              onClick={() => setShowModal(false)}
            />

            {/* Contenu de la modal */}
            <div className="relative bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto animate-fadeIn scale-95">
              <h2 className="text-xl font-semibold mb-4">
                {isPublic ? "Modifier le serveur" : "Ouvrir le serveur"}
              </h2>

              <label className="block text-sm font-medium mb-1">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 rounded-lg mb-4 bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="ex : jeux, français, détente"
              />

              <div className="flex justify-between items-center mt-6">
                {/* Annuler modal */}
                <button
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>

                <div className="flex gap-2">
                  {/* Fermer serveur si déjà public */}
                  {isPublic && (
                    <button
                      className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      onClick={handleCloseServer}
                    >
                      Fermer
                    </button>
                  )}

                  {/* Confirmer ouverture / modification */}
                  <button
                    className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                    onClick={handleOpenServer}
                  >
                    Confirmer
                  </button>
                </div>
              </div>

              {/* Bouton fermer (X) */}
              <button
                className="absolute top-3 right-3 text-gray-300 hover:text-white font-bold"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}
    </li>
  );
}
