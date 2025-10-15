import { useState } from "react";
import type { Server } from "./servers-page";

interface JoinServerFormProps {
    onJoined: (server: Server) => void;
}

export function JoinServerForm({ onJoined }: JoinServerFormProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:3000/servers/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (res.ok) {
                onJoined(data);
                setCode("");
            } else {
                setError(data.message || "Erreur inconnue");
            }
        } catch (err) {
            setError("Erreur réseau");
            console.error("Erreur rejoindre serveur :", err);
        } finally {
            setLoading(false);
        }
    }

    return (
    <form
      onSubmit={handleJoin}
      className="p-4 border rounded bg-gray-50 flex flex-col gap-2"
    >
      <h2 className="text-lg font-semibold">Rejoindre un serveur</h2>

      <input
        type="text"
        placeholder="Code d'invitation du serveur"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border p-2 rounded"
        required
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Connexion..." : "Rejoindre"}
      </button>
    </form>
  );
}