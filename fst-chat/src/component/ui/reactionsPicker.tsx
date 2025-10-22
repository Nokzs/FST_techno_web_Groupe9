import { useRef, useEffect } from "react";

interface ReactionMenuProps {
  onSelect: (emoji: string) => void;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function ReactionMenu({
  onSelect,
  showMenu,
  setShowMenu,
}: ReactionMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  // ferme le menu si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setShowMenu]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
      >
        😊
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 z-50">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                setShowMenu((show) => !show);
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
