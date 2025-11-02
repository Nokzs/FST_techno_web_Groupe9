import type { Server } from "./servers-page";
import { ServerItem } from "./server-item";

interface ServersListProps {
  servers: Server[];
  roles?: Record<string, string>;
  onRemoved?: (serverId: string) => void;
}

export function ServersList({ servers, roles = {}, onRemoved }: ServersListProps) {
  if (!servers.length)
    return <div className="text-gray-400 text-center">Aucun serveur pour le moment.</div>;

  return (
    <ul className="space-y-3">
      {servers.map((server) => {
        const sid = server._id ?? server.id;
        return (
          <ServerItem key={sid} server={server} role={roles[sid]} onRemoved={onRemoved} />
        );
      })}
    </ul>
  );
}
