import type { Message } from "./messageFileType";
import { FilePreview } from "./FilePreview";
import { useState, useRef, useEffect } from "react";
import { ReactionMenu } from "../../ui/reactionsPicker";
import { socket } from "../../../socket";
import type { User } from "../../../types/user";
interface MessageProps {
  currentUserId: string | undefined;
  message: Message;
  onReply?: (message: Message) => void;
  channelId?: string;
}

export function MessageItem({
  message,
  currentUserId,
  onReply,
  channelId,
}: MessageProps) {
  const isOwnMessage = message.senderId._id === currentUserId;
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const date = new Date(message.createdAt);
  const formattedDate = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const grouped = message.reactions.reduce((acc: Record<string, User[]>, r) => {
    acc[r.emoji] = acc[r.emoji] ? [...acc[r.emoji], r.userId] : [r.userId];
    return acc;
  }, {});
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      const timeout = setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", handleClickOutside);
      };
    }
  }, [menuOpen]);
  const addReaction = (emoji: string) => {
    socket.emit("newReactions", { messageId: message._id, emoji, channelId });
  };
  if (!currentUserId) return null;

  return (
    <div
      className={`flex flex-col group gap-1 my-2 max-w-[75%] relative ${
        isOwnMessage ? "self-end items-end pr-3" : "self-start items-start pl-3"
      }`}
    >
      <div
        className={`p-10 rounded-2xl shadow-sm flex flex-col relative ${
          isOwnMessage
            ? "bg-green-500 text-white rounded-bl-none"
            : "bg-blue-500 text-white rounded-br-none"
        }`}
      >
        {message.replyMessage && (
          <div className="mb-2 p-2 bg-white/20 rounded border-l-4 border-white/50 text-sm">
            <span className="font-medium">{message.receiverId?.pseudo}</span>
            <span className="line-clamp-1">{message.replyMessage.content}</span>
          </div>
        )}

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
          <span className="font-medium">{message.senderId.pseudo}</span> —{" "}
          <span>{formattedDate}</span>
        </div>
        {/* Bouton menu */}

        {!isOwnMessage && (
          <>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-1 right-1 flex flex-row">
              <ReactionMenu
                onSelect={addReaction}
                showMenu={showReactionMenu}
                setShowMenu={setShowReactionMenu}
              />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className=" top-2 right-2 p-1 rounded-full hover:bg-white/20"
                >
                  :
                </button>

                {/* Menu contextuel */}
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute top-0 left-[100%] ml-2 bg-white text-black rounded-lg shadow-lg z-10 w-32"
                  >
                    <ul className="flex flex-col">
                      <li
                        className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          console.log(message);
                          onReply?.({
                            ...message,
                            receiverId: message.senderId._id,
                          });
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
            {Object.keys(grouped).length > 0 && (
              <div className="flex gap-2 mt-2 absolute bottom-0 left-0 translate-y-full mb-5">
                {Object.entries(grouped).map(([emoji, users]) => {
                  const reacted = users.some(
                    (user) => user._id === currentUserId,
                  );
                  return (
                    <button
                      key={emoji}
                      onClick={() => addReaction(emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition 
                  ${reacted ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                    >
                      <span>{emoji}</span>
                      <span>{users.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
