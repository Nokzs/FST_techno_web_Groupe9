import { useState } from "react";
import type { Server } from "./servers-page";

interface CreateServerFormProps {
  onCreated: (server: Server) => void;
}

export function CreateServerForm({ onCreated }: CreateServerFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (res.ok) {
        onCreated(data);
        setName("");
        setDescription("");
      } else {
        console.error("Erreur création serveur :", data);
      }
    } catch (err) {
      console.error("Erreur création serveur :", err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-gray-800 rounded-2xl shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-white mb-3 text-center">
        Créer un nouveau serveur
      </h2>

      <div className="flex flex-col space-y-3">
        <input
          type="text"
          placeholder="Nom du serveur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-2 rounded bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          placeholder="Description du serveur (optionnelle)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 p-2 rounded bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
        >
          Créer le serveur
        </button>
      </div>
    </form>
  );
}
