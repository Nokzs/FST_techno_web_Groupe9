import { useState, useEffect, useRef, useCallback } from "react";
import type { Server } from "../../../api/servers/servers-page";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

export function FindServer() {
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const last_id = servers.length > 0 ? servers[servers.length - 1]._id : "";

  const joinServer = async (serverId: string) => {
    try {
      const res = await fetch(`${API_URL}/servers/openJoin`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ serverId }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setServers((prev) => prev.filter((s) => s._id !== serverId));
        toast.success("Vous avez rejoint le serveur !"); // <-- toast succès
      } else {
        toast.error("Impossible de rejoindre le serveur."); // <-- toast erreur
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau."); // <-- toast erreur
    }
  };

  const getServers = useCallback(
    async (id?: string) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/servers/find?last_id=${id || ""}&SearchName=${searchName}&SearchTag=${searchTags}`,
          { credentials: "include" },
        );

        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();

        if (id) setServers((prev) => [...prev, ...data]);
        else setServers(data);

        setHasMore(data.length >= 20);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, searchName, searchTags, loading],
  );

  // Debounce la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMore(true);
      getServers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchName, searchTags]);

  // Intersection observer pour scroll infini
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current?.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          getServers(last_id);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, last_id],
  );

  return (
    <div className="p-4 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster position="top-right" />
      <div className="flex items-center mb-6 gap-4 justify-center">
        <NavLink to="/servers" className="text-2xl">
          {"<-"}
        </NavLink>
        <h2 className="text-2xl font-bold  text-center">{t("server.find")}</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Nom du serveur..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="flex-1 p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Tags séparés par des virgules..."
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          className="flex-1 p-2 border rounded-md bg-white text-black dark:text-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.length > 0
          ? servers.map((server) => (
              <div
                key={server._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col justify-between transition hover:shadow-lg"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-1">{server.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {server.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tags: {server.tags.join(", ")}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {server.members?.length ?? 0} membres
                  </span>

                  <button
                    onClick={() => joinServer(server._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            ))
          : !loading && (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">
                Aucun serveur trouvé.
              </p>
            )}
      </div>
      {/* Sentinel pour scroll infini */}
      <div
        ref={sentinelRef}
        className="h-10 mt-4 flex justify-center items-center"
      >
        {loading && <span className="text-gray-500">Chargement...</span>}
      </div>
    </div>
  );
}
