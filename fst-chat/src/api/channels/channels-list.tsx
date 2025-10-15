// src/channels/channel-list.tsx
import { ChannelItem } from "./channel-item";
import type { Channel } from "../servers/servers-page";
import { CreateChannelForm } from "./create-channel-form";
import { useState } from "react";

interface ChannelListProps {
  serverId: string;
  channels: Channel[];
  onChannelAdded: (newChannel: Channel) => void;
}

export function ChannelList({ serverId, channels, onChannelAdded }: ChannelListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mb-4 border rounded p-2 bg-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">
          Salons ({channels.length})
        </h3>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="text-sm text-blue-500 hover:underline"
        >
          {showForm ? "Annuler" : "Ajouter un salon"}
        </button>
      </div>

      {showForm && (
        <CreateChannelForm serverId={serverId} onCreated={onChannelAdded} />
      )}

      <ul className="space-y-1">
        {channels.map((channel) => (
          <ChannelItem key={channel._id} _id={channel._id} name={channel.name} />
        ))}
      </ul>
    </div>
  );
}
