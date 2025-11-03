import { useEffect, useState } from "react";
import { ServersList } from "./servers-list";
import { CreateServerForm } from "./create-server-form";
import { JoinServerForm } from "./join-server-form";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
export interface Server {
  _id: string;
  id?: string;
  name: string;
  ownerId: string;
  description?: string;
  members?: string[];
  channels?: Channel[];
  createdAt?: string;
  updatedAt?: string;
  tags: string[]; // obligatoire
  isPublic: boolean; // indique si le serveur est ouvert au public
  inviteCode?: string;
  defaultRole?: "MEMBER" | "READER";
}
export interface Channel {
  _id: string;
  name: string;
  topic?: string;
  serverId: string;
  createdAt?: string;
  updatedAt?: string;
  notification: notification[];
}
export type notification = {
  _id: string;

  channelId: string;

  serverId: string;

  seenBy: string[];
  createdAt:Date;
};
export function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"create" | "join" | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { t } = useTranslation();
  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch(`${API_URL}/servers`, {
          // le cookie avec le token est inclus dans la requete
          credentials: "include",
        });
        const data = await res.json();
        const list: Server[] = Array.isArray(data) ? data : [];
        setServers(list);
        const entries: [string, string][] = [];
        await Promise.all(
          list.map(async (srv: Server) => {
            const id = srv._id || srv.id;
            if (!id) return;
            try {
              const r = await fetch(`${API_URL}/servers/${id}/me`, {
                credentials: "include",
              });
              const jr = await r.json();
              if (jr?.role) entries.push([id, jr.role]);
            } catch {
              /* ignore */
            }
          }),
        );
        console.log("roles pour chaque serveur: " + entries);

        setRoles(Object.fromEntries(entries));
      } catch (err) {
        console.error("Erreur rÃ©cupÃ©ration serveurs :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchServers();
  }, [API_URL]);

  // si roles pas encore attribuÃ© pour des serveurs, on les attributs (lors de la crÃ©ation d'un nouveau serveur)
  useEffect(() => {
    // RÃ©cupÃ¨re tous les ID des serveurs
    const ids = servers.map((s: Server) => (s?._id ?? s?.id) as string);

    // Ne garde que ceux qui n'ont pas encore d'entrÃ©e dans la map `roles`
    const missing = ids.filter((id) => !(id in roles));
    if (missing.length === 0) return;
    (async () => {
      const entries: [string, string][] = [];
      await Promise.all(
        missing.map(async (id) => {
          try {
            const r = await fetch(`${API_URL}/servers/${id}/me`, {
              credentials: "include",
            });
            const jr = await r.json();
            if (jr?.role) entries.push([id, jr.role]);
          } catch {
            /* ignore */
          }
        }),
      );
      // 4) Fusionne proprement dans la map `roles` (sans Ã©craser les valeurs existantes)
      if (entries.length)
        setRoles((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
  }, [servers, roles, API_URL]);

  const handleServerAdded = (newServer: Server) => {
    setServers((prev) => {
      const exists = prev.some((s) => s._id === newServer._id);
      if (exists) {
        setJoinError("Ce serveur est dÃ©jÃ  dans votre liste.");
        return prev;
      }
      setJoinError(null);
      return [...prev, newServer];
    });
    setActiveForm(null);
  };

  const handleServerRemoved = (serverId: string) => {
    setServers((prev) => prev.filter((s) => s._id !== serverId));
  };
  if (loading) return <div>Chargement des serveurs...</div>;
  if (loading) return <div>{t("server.loading")}</div>;

  return (
    <div className=" p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-white text-black ">
        {t("server.list")}
      </h1>

      <div className="flex gap-2 mb-4">
        <button
          className="bg-blue-500 dark:text-white text-black px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => setActiveForm("create")}
        >
          {t("server.create")}
        </button>
        <button
          className="bg-green-500 dark:text-white text-black px-3 py-1 rounded hover:bg-green-600"
          onClick={() => setActiveForm("join")}
        >
          {t("server.join")}
        </button>
        <NavLink
          to="/servers/find"
          className="bg-green-500 dark:text-white text-black px-3 py-1 rounded hover:bg-green-600"
        >
          {t("server.find")}
        </NavLink>
      </div>

      {joinError && (
        <div className="mb-4 text-red-500 text-sm">{joinError}</div>
      )}

      {activeForm === "create" && (
        <CreateServerForm onCreated={handleServerAdded} />
      )}
      {activeForm === "join" && <JoinServerForm onJoined={handleServerAdded} />}

      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 rounded-lg">
        <ServersList
          servers={servers}
          roles={roles}
          onRemoved={handleServerRemoved}
        />
      </div>
    </div>
  );
}
