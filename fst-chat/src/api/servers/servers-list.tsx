import type { Server } from "./servers-page";
import { ServerItem } from "./server-item";

interface ServersListProps {
  servers: Server[];
}

export function ServersList({ servers }: ServersListProps) {
  if (!servers.length)
    return <div className="text-gray-400 text-center">Aucun serveur pour le moment.</div>;

  return (
    <ul className="space-y-3">
      {servers.map((server) => (
        <ServerItem key={server._id} server={server} />
      ))}
    </ul>
  );
}
