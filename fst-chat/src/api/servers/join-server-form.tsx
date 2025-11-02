import { useState } from "react";
import type { Server } from "./servers-page";
interface JoinServerFormProps {
  onJoined: (server: Server) => void;
}

export function JoinServerForm({ onJoined }: JoinServerFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/servers/join`, {
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
      setError("Erreur r�seau");
      console.error("Erreur rejoindre serveur :", err);
    } finally {
      setLoading(false);
    }
  }

    return (
    <form onSubmit={handleJoin} className="mb-6 p-4 bg-gray-800 rounded-2xl shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-3 text-center">Rejoindre un serveur</h2>

      <div className="flex flex-col space-y-3">
        <input
          type="text"
          placeholder="Code d'invitation du serveur"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-gray-300 p-2 rounded bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Rejoindre"}
        </button>
      </div>
    </form>
  );
}
