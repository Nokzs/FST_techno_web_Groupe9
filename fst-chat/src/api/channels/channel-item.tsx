// src/channels/channel.tsx
import { useNavigate } from "react-router";
import type { Channel } from "../servers/servers-page";

export function ChannelItem({ _id, name }: Channel) {
  const navigate = useNavigate();
  
   return (
    <li
      className="p-2 hover:bg-gray-200 rounded cursor-pointer"
      onClick={() => navigate(`/messages/${_id}`)}
    >
      {name}
    </li>
  );
}