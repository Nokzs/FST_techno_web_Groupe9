import type { Message } from "../../../types/messageFileType";
import { FilePreview } from "./FilePreview";
import { useState, useRef, useEffect, Suspense } from "react";
import { ReactionMenu } from "../../ui/reactionsPicker";
import { socket } from "../../../socket";
import type { User } from "../../../types/user";
import { cn } from "../../../utils/cn";
import { AnimatePresence, motion, easeInOut, easeIn } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "../../ui/userAvatar";
import { can } from "../../../utils/roles";
import type { AppRole } from "../../../utils/roles";

interface MessageProps {
  currentUserId: string;
  message: Message;
  onReply?: (message: Message) => void;
  channelId?: string;
  messageRef?: React.RefObject<HTMLDivElement | null>;
  isOwner: boolean;
  ROLE?: AppRole;
}

export function MessageItem({
  message,
  currentUserId,
  onReply,
  channelId,
  messageRef,
  isOwner,
  ROLE,
}: MessageProps) {
  const { t } = useTranslation();
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isReplyToMe =
    message.replyMessage && (message.receiverId?._id as string) === currentUserId;

  const date = new Date(message.createdAt);
  const formattedDate = date.toLocaleTimeString([], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
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

  const messageClasses = cn(
    "pt-8 pb-1 px-5 rounded-2xl shadow-sm flex flex-col relative transition-all",
    isOwner
      ? "bg-green-500 text-white rounded-bl-none"
      : "bg-blue-500 text-white rounded-br-none",
    isReplyToMe &&
      "bg-[rgba(4,40,145,0.3)] border-4 border-[rgba(4,40,145,0.95)] shadow-[0_0_20px_5px_rgba(4,40,145,0.95)]",
  );

  function deleteMessage() {
    socket.emit("deleteMessage", { messageId: message._id, channelId });
  }

  const pinMessage = () => {
    socket.emit("pinMessage", message);
  };

  if (!currentUserId || isOwner === undefined) {
    return null;
  }

  return (
    <Suspense fallback={<></>}>
      <div
        className={cn(
          "flex gap-2 my-2 max-w-[75%] relative group",
          isOwner ? "self-end flex-row-reverse" : "self-start flex-row pl-3",
        )}
      >
        <UserAvatar
          rootRef={messageRef}
          url={
            message.senderId.urlPicture ||
            "https://avatar.iran.liara.run/public/20"
          }
        />
        <div className="flex flex-col group gap-1 relative w-full">
          <div className={messageClasses}>
            <span
              className={cn(
                "font-medium absolute top-0 mt-2 ml-2",
                isOwner ? "right-0 mr-2" : "left-0",
              )}
            >
              {message.senderId.pseudo}
              {message.isPin && (
                <span className="ml-1 text-yellow-400" title="Message épinglé">
                  📌
                </span>
              )}
            </span>

            {/* Message cité */}
            {message.replyMessage && (
              <div className="mb-2 p-2 bg-white/20 max-w-32 truncate rounded border-l-4 border-white/50 text-sm">
                <span className="font-medium">
                  {message.receiverId?.pseudo}
                </span>
                <span className="line-clamp-1">
                  {message.replyMessage.isDeleted
                    ? t("tchat.messageDeleted")
                    : message.replyMessage.content}
                </span>
              </div>
            )}

            {/* Texte */}
            {message.content &&
              (!message.isDeleted ? (
                <div className="whitespace-pre-wrap break-all overflow-hidden overflow-wrap-anywhere mb-1">
                  {message.content}
                </div>
              ) : (
                <div className="italic text-white/70 mb-1">
                  {t("tchat.messageDeleted")}
                </div>
              ))}

            {/* Fichiers */}
            {message.files?.length > 0 && !message.isDeleted && (
              <div className="flex flex-wrap gap-3 mt-1">
                {message.files.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    scrollContainerRef={messageRef}
                  />
                ))}
              </div>
            )}

            {/* Loader */}
            {message.sending && message.files?.length === 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                <span className="text-xs text-white/80">Envoi...</span>
              </div>
            )}

            {/* Nom + heure */}
            <div
              className={`text-xs mt-2 opacity-80 ${isOwner ? "text-right" : "text-left"}`}
            >
              <span>{formattedDate}</span>
            </div>

            {/* Menu réactions et options */}
            <div
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-1 flex flex-row ${
                isOwner ? "left-1 flex-row-reverse" : "right-1"
              }`}
            >
              <ReactionMenu
                onSelect={addReaction}
                showMenu={showReactionMenu}
                setShowMenu={setShowReactionMenu}
              />

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-1 rounded-full hover:bg-white/20"
                >
                  :
                </button>

                {menuOpen && (
                  <div
                    ref={menuRef}
                    className={cn(
                      "absolute top-0 bg-white text-black rounded-lg shadow-lg z-10 w-32",
                      isOwner ? "right-[100%] mr-2" : "left-[100%] ml-2",
                    )}
                  >
                    <ul className="flex flex-col">
                      {!isOwner && (
                        <li
                          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => {
                            onReply?.({
                              ...message,
                              receiverId: message.senderId,
                            });
                            setMenuOpen(false);
                          }}
                        >
                          Répondre
                        </li>
                      )}

                      {isOwner && (
                        <li
                          className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-red-600 font-medium"
                          onClick={() => {
                            deleteMessage();
                            setMenuOpen(false);
                          }}
                        >
                          {t("tchat.deleteMessage")}
                        </li>
                      )}
                      {can(ROLE, "ADMIN") && (
                        <li
                          className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-black font-medium"
                          onClick={() => {
                            pinMessage();
                            setMenuOpen(false);
                          }}
                        >
                          {!message.isPin
                            ? t("tchat.pinMessage")
                            : t("tchat.unpinMessage")}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Réactions */}
            <div
              className={cn(
                "flex gap-2 mt-2 absolute -bottom-4 translate-y-full mb-5",
                isOwner
                  ? "justify-end right-0 flex-row-reverse"
                  : "justify-start left-0 flex-row",
              )}
            >
              <AnimatePresence mode="popLayout">
                {Object.entries(grouped).map(([emoji, users]) => {
                  const reacted = users.some(
                    (user) => {return user._id === currentUserId},
                  );
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0 }}
                      key={emoji + users.length}
                      onClick={() => addReaction(emoji)}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      whileTap={{
                        scale: 1.1,
                        transition: { duration: 0.2, ease: easeInOut },
                      }}
                      whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.1, ease: easeIn },
                      }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition ${
                        reacted
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{users.length}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
