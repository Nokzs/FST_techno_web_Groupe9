import type { Server } from "./servers";

interface ServersListProps {
  servers: Server[];
}

export function ServersList({ servers }: ServersListProps) {
  if (!servers.length)
    return <div className="text-gray-500">Aucun serveur pour le moment.</div>;

  return (
  
    <ul className="space-y-2">
      {servers.map((server, index) => (
        <li key={index} className="p-2 border rounded">
          <div className="font-semibold">{server.name}</div>
          <div className="text-sm text-gray-500">{server.description}</div>
          <div className="text-xs text-gray-400">
            Membres: {server.members?.length || 0} | Salons:{" "}
            {server.channels?.length || 0}
          </div>
        </li>
      ))}
    </ul>
  );
}
