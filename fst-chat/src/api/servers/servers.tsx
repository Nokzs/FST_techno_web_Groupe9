import { useEffect, useState } from "react";
import { ServersList } from "./servers-list";
import { CreateServerForm } from "./create-server-form";
import { JoinServerForm } from "./join-server-form";

export interface Server {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  members?: string[];
  channels?: string[];
}

export function Servers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"create" | "join" | null>(null);
  // const [userId, setUserId] = useState<string | null>(null);


  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch("http://localhost:3000/servers", {
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
  }, []);

  const handleServerAdded = (newServer: Server) => {
    setServers((prev) => [...prev, newServer]);
    setActiveForm(null);
  };

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
