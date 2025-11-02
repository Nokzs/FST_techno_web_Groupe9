// src/channels/channel.tsx
import { useNavigate } from "react-router";
import { can, type AppRole } from "../../utils/roles";

export function ChannelItem({ _id, name, serverId, role, onRemoved }: { _id: string; name: string; serverId: string; role?: AppRole; onRemoved?: (id: string) => void }) {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function deleteChannel(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/channels/${_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        onRemoved?.(_id);
      } else {
        console.error('Suppression channel échouée:', await res.text());
      }
    } catch (err) {
      console.error('Suppression channel erreur:', err);
    }
  }

  return (
    <li
      className="p-2 hover:bg-gray-200 rounded cursor-pointer flex items-center justify-between"
      onClick={() => navigate(`/messages/${serverId}/${_id}`)}
    >
      <span>{name}</span>
      {can(role, 'CREATOR') && (
        <button
          className="text-xs text-red-600 hover:underline"
          title="Supprimer le salon"
          onClick={deleteChannel}
        >
          Supprimer
        </button>
      )}
    </li>
  );
}
