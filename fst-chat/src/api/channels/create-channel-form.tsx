// src/channels/create-channel-form.tsx
import { useState } from "react";
import type { Channel } from "../servers/servers-page";

interface CreateChannelFormProps {
  serverId: string;
  onCreated: (newChannel: Channel) => void;
}

export function CreateChannelForm({ serverId, onCreated }: CreateChannelFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    try {
      const res = await fetch(`${API_URL}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ serverId, name }),
      });

      const data = await res.json();
      if (res.ok) {
        onCreated(data);
        setName("");
      } else {
        console.error("Erreur création salon :", data);
      }
    } catch (err) {
      console.error("Erreur création salon :", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <input
        type="text"
        placeholder="Nom du salon"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded p-1 w-full mb-1"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
      >
        Créer
      </button>
    </form>
  );
}
