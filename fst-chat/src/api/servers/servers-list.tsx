import type { Server } from "./servers-page";
import { ServerItem } from "./server-item";
import { useTranslation } from "react-i18next";
interface ServersListProps {
  servers: Server[];
}

export function ServersList({ servers }: ServersListProps) {
  const { t } = useTranslation();
  if (!servers.length)
    return (
      <div className="text-gray-400 text-center">{t("server.noServer")}</div>
    );

  return (
    <ul className="space-y-3 flex items-center flex-col">
      {servers.map((server) => (
        <ServerItem key={server._id} server={server} />
      ))}
    </ul>
  );
}
