import type { User } from "../../types/user";

type MemberItemProps = {
  user: User;
  onClick?: (user: User) => void;
  isOnline?: boolean;
};

export function MemberItem({
  user,
  onClick,
  isOnline = false,
}: MemberItemProps) {
  const name = user.pseudo || user.email || "Unknown";
  const avatar = user.urlPicture;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer h-full"
      onClick={() => onClick?.(user)}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
      )}
      <span
        className={
          "inline-block w-2 h-2 rounded-full " +
          (isOnline ? "bg-green-500" : "bg-gray-400")
        }
        title={isOnline ? "En ligne" : "Hors ligne"}
      />
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
          {name}
        </span>
        {user.bio ? (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.bio}
          </span>
        ) : null}
      </div>
    </div>
  );
}
