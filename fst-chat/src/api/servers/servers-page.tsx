import { useEffect, useState, useCallback } from "react";
import { ServersList } from "./servers-list";
import { CreateServerForm } from "./create-server-form";
import { JoinServerForm } from "./join-server-form";

export interface Server {
  _id: string;
  name: string;
  ownerId: string;
  description?: string;
  members?: string[];
  channels?: Channel[];
  createdAt?: string;
  updatedAt?: string;
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

  // Typage explicite pour éviter les surprises de build
  const API_URL: string =
    (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

  useEffect(() => {
    let isMounted = true;
    async function fetchServers() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/servers`, {
          credentials: "include", // inclure le cookie token
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          setServers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erreur récupération serveurs :", err);
        if (isMounted) setServers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchServers();
    return () => {
      isMounted = false;
    };
  }, [API_URL]); // ✅ ajoute API_URL dans les dépendances

  const handleServerAdded = useCallback((newServer: Server) => {
    setServers((prev) => [...prev, newServer]);
    setActiveForm(null);
  }, []);

  if (loading) return <div>Chargement des serveurs...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des serveurs</h1>

      <div className="flex gap-2 mb-4">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => setActiveForm("create")}
        >
          Créer un serveur
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          onClick={() => setActiveForm("join")}
        >
          Rejoindre un serveur
        </button>
      </div>

      {activeForm === "create" && (
        <CreateServerForm onCreated={handleServerAdded} />
      )}
      {activeForm === "join" && <JoinServerForm onJoined={handleServerAdded} />}

      <ServersList servers={servers} />
    </div>
  );
}
