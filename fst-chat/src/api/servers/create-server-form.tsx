import { useState } from "react";
import type { Server } from "./servers";

interface CreateServerFormProps {
    onCreated: (server: Server) => void;
}

export function CreateServerForm({ onCreated }: CreateServerFormProps) {
    const [name, setName] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/servers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (res.ok) {
                onCreated(data);
                setName("");
            } else {
                console.error("Erreur création serveur :", data);
            }
        } catch (err) {
            console.error("Erreur création serveur :", err);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <input
                type="text"
                placeholder="Nom du serveur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 rounded mr-2"
            />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Créer
            </button>
        </form>
    );
}