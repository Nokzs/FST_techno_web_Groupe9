import type { Message } from "./messageFileType";
import { FilePreview } from "./FilePreview";
import { useState, useRef, useEffect } from "react";

interface MessageProps {
  currentUserId: string;
  message: Message;
  onReply?: (message: Message) => void;
}

export function MessageItem({ message, currentUserId, onReply }: MessageProps) {
  const isOwnMessage = message.senderId !== currentUserId;
  const [showReply, setShowReply] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const date = new Date(message.createdAt);
  const formattedDate = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Vérifie si le clic est en dehors du menu
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      // Timeout pour ignorer le tout premier clic (celui qui ouvre le menu)
      const timeout = setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", handleClickOutside);
      };
    }
  }, [menuOpen]);

  return (
    <div
      className={`flex flex-col gap-1 my-2 max-w-[75%] relative ${
        isOwnMessage ? "self-end items-end pr-3" : "self-start items-start pl-3"
      }`}
    >
      <div
        onMouseEnter={() => setShowReply(true)}
        onMouseLeave={() => setShowReply(false)}
        className={`p-6 rounded-2xl shadow-sm flex flex-col relative ${
          isOwnMessage
            ? "bg-green-500 text-white rounded-bl-none"
            : "bg-blue-500 text-white rounded-br-none"
        }`}
      >
        {/* Texte */}
        {message.content && (
          <div className="whitespace-pre-wrap break-words mb-1">
            {message.content}
          </div>
        )}

        {/* Fichiers */}
        {message.files?.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {message.files.map((file, index) => (
              <FilePreview key={index} file={file} />
            ))}
          </div>
        )}

        {/* Nom + heure */}
        <div
          className={`text-xs mt-2 opacity-80 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          <span className="font-medium">{message.senderId}</span> —{" "}
          <span>{formattedDate}</span>
        </div>

        {/* Bouton menu (Répondre, Supprimer...) */}
        {!isOwnMessage && showReply && (
          <button
            onClick={() => {
              setMenuOpen((prev) => !prev);
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20"
          >
            :
          </button>
        )}

        {/* Menu contextuel */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-10 left-[100%] bg-white text-black rounded-lg shadow-lg z-10 w-32"
          >
            <ul className="flex flex-col">
              <li
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  onReply?.(message);
                  setMenuOpen(false);
                }}
              >
                Répondre
              </li>
              <li
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  alert("Option supprimer");
                  setMenuOpen(false);
                }}
              >
                Supprimer
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
