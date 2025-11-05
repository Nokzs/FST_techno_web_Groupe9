import { useNavigate } from "react-router";
import type { User } from "../../types/user";
import { useTranslation } from "react-i18next";
type profilItemProps = {
  user: User | null;
  isOnline: boolean;
};
export const ProfilItem = ({ user, isOnline }: profilItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const name = user?.pseudo || user?.email || "Unknown";
  const avatar = user?.urlPicture;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    const API_URL = import.meta.env.API_URL || "http://localhost:3002";

    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        navigate("/login");
      } else {
        console.error("Erreur lors de la déconnexion :", await res.text());
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Left section: Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center text-sm font-semibold ring-2 ring-gray-300 dark:ring-gray-700">
              {initials}
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-gray-100 dark:ring-gray-800 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {name}
          </span>
          {user?.bio && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.bio}
            </span>
          )}
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/profil")}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="View profile"
        >
          {t("tchat.profil")}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
          title="Logout"
        >
          {t("tchat.logout")}
        </button>
      </div>
    </div>
  );
};
