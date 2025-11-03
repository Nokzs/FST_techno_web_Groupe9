import type { Server } from "./servers-page";
import { ServerItem } from "./server-item";
import { useTranslation } from "react-i18next";
import type { AppRole } from "../../utils/roles";
interface ServersListProps {
  servers: Server[];
  roles?: Record<string, string>;
  onRemoved?: (serverId: string) => void;
}

export function ServersList({
  servers,
  roles = {},
  onRemoved,
}: ServersListProps) {
  const { t } = useTranslation();
  if (!servers.length)
    return (
      <div className="text-gray-400 text-center">{t("server.noServer")}</div>
    );

  return (
    <ul className="space-y-3">
      {servers.map((server) => {
        const sid = server._id ?? server.id;
        return (
          <ServerItem
            key={sid}
            server={server}
            role={roles[sid] as AppRole}
            onRemoved={onRemoved}
          />
        );
      })}
    </ul>
  );
}
