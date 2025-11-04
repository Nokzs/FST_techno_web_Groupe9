import type { User } from "../../types/user";
import { MemberItem } from "./member-item";
import { useState } from "react";
import { can, type AppRole } from "../../utils/roles";
import { ProfilItem } from "./profil-item";
type MembersListProps = {
  user: User | null;
  serverId: string;
  users: User[];
  onlineIds?: string[];
  className?: string;
  onSelect?: (user: User) => void;
  myRole?: AppRole;
  rolesByUserId?: Record<string, string>;
  onRoleChange?: (userId: string, role: string) => void;
};

export function MembersList({
  user,
  serverId,
  users,
  onlineIds = [],
  className = "",
  onSelect,
  myRole,
  rolesByUserId = {},
  onRoleChange,
}: MembersListProps) {
  const [selected, setSelected] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const handleSelect = (u: User) => {
    setSelected(u);
    onSelect?.(u);
  };

  return (
    <div className="flex flex-col h-full">
      <aside className={`w-64 shrink-0 p-3 ${className}`}>
        {users && users.length > 0 ? (
          <ul className="space-y-1 flex flex-col">
            {users.map((u, idx) => (
              <MemberItem
                key={u.id || idx}
                user={u}
                onClick={handleSelect}
                isOnline={onlineIds.includes(u.id)}
              />
            ))}
            <div className="fixed bottom-0 w-full md:w-64 p-3 bg-gray-50 dark:bg-gray-900">
              <ProfilItem
                user={user}
                isOnline={onlineIds.includes(user?.id || "")}
              />
            </div>
          </ul>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 px-2">
            Aucun membre
          </div>
        )}

        {selected && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 w-80 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                {selected.urlPicture ? (
                  <img
                    src={selected.urlPicture}
                    alt={selected.pseudo || selected.email || "Profil"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {selected.pseudo || selected.email || selected.id}
                  </div>
                  {selected.email && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selected.email}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Rôle: {rolesByUserId[selected.id] || "MEMBER"}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {selected.bio || "Aucune bio"}
              </p>
              {myRole && can(myRole, "ADMIN") && selected.id && (
                <div className="mb-3">
                  {(() => {
                    const targetRole = rolesByUserId[selected.id] || "MEMBER";
                    const isCreator = targetRole === "CREATOR";
                    const isSelf = selected.id === (user?.id || "");
                    const canEdit =
                      !isSelf && (myRole === "CREATOR" || (myRole === "ADMIN" && !isCreator));
                    if (!canEdit) return null;
                    const options =
                    
                      myRole === "CREATOR"
                        ? ["ADMIN", "MEMBER", "READER"]
                        : ["MEMBER", "READER"];                    const current = editingRole ?? targetRole;
                    return (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          Changer le rôle:
                        </label>
                        <select
                          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                          value={current}
                          onChange={(e) => setEditingRole(e.target.value)}
                        >
                          {options.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button
                          className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
                          onClick={async () => {
                            const role = editingRole ?? targetRole;
                            try {
                              const API_URL =
                                import.meta.env.VITE_API_URL ||
                                "http://localhost:3000";
                              const res = await fetch(
                                `${API_URL}/roles/server/${serverId}/members/${selected.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  credentials: "include",
                                  body: JSON.stringify({ role }),
                                },
                              );
                              if (res.ok) {
                                onRoleChange?.(selected.id, role);
                                setEditingRole(null);
                              } else {
                                console.error(
                                  "Erreur changement de rôle",
                                  await res.text(),
                                );
                              }
                            } catch (e) {
                              console.error("Erreur changement de rôle", e);
                            }
                          }}
                        >
                          Enregistrer
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setSelected(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
