import { useEffect, useState } from "react";
import { ServersList } from "./servers-list";
import { CreateServerForm } from "./create-server-form";
import { JoinServerForm } from "./join-server-form";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
export interface Server {
  _id: string;
  name: string;
  ownerId: string;
  description?: string;
  members?: string[];
  channels?: Channel[];
  createdAt?: string;
  updatedAt?: string;
  tags: string[]; // obligatoire
  isPublic: boolean; // indique si le serveur est ouvert au public
}
export interface Channel {
  _id: string;
  name: string;
  topic?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"create" | "join" | null>(null);
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
        setServers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur récupération serveurs :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchServers();
  }, [API_URL]);

  const handleServerAdded = (newServer: Server) => {
    setServers((prev) => [...prev, newServer]);
    console.log("Nouveau serveur ajouté :", newServer);
    console.log("Serveurs actuels :", servers);
    setActiveForm(null);
  };

  if (loading) return <div>{t("server.loading")}</div>;

  return (
    <div className="p-4">
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

      {activeForm === "create" && (
        <CreateServerForm onCreated={handleServerAdded} />
      )}
      {activeForm === "join" && <JoinServerForm onJoined={handleServerAdded} />}

      <ServersList servers={servers} />
    </div>
  );
}
