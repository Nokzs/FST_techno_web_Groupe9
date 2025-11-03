import { useRef } from "react";
import { FilePreview } from "./FilePreview";
import type { Message, MessageFile } from "../../../types/messageFileType";
import { socket } from "../../../socket";
import { UserAvatar } from "../../ui/userAvatar";
import { can, type AppRole } from "../../../utils/roles";
type PinnedMessagesProps = {
  messages: Message[];
  role:AppRole
};

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages,role }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pinMessage = (message: Message) => {
    socket.emit("pinMessage", message);
  };
  if (messages.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Aucun message épinglé pour le moment.
      </div>
    );
  }
 if(!scrollRef) return <></>
  return (
    <div
      ref={scrollRef}
      className="p-4 max-h-[400px] overflow-y-auto bg-gray-800 text-white rounded-lg"
    >
      <h3 className="font-semibold mb-2">Messages épinglés</h3>
      <ul className="flex flex-col gap-3">
        {messages
          .filter((msg) => msg.isPin)
          .map((msg) => (
            <li
              key={msg._id}
              className="group p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer relative flex gap-2"
            >
              {/* Avatar */}
              <UserAvatar
                rootRef={scrollRef}
                url={
                  msg.senderId.urlPicture ||
                  "https://avatar.iran.liara.run/public/20"
                }
              />

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{msg.senderId.pseudo}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-1">{msg.content}</div>

                {msg.files?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.files.map((file: MessageFile, i) => (
                      <FilePreview
                        key={i}
                        file={file}
                        scrollContainerRef={scrollRef}
                      />
                    ))}
                  </div>
                )}
              </div>
                
              {/* Punaise cliquable seulement au hover */}
              {can(role,"CREATOR") &&
              <span
                onClick={() => pinMessage(msg)}
                className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-300 text-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Désépingler"
              >
                📌
              </span>}
            </li>
          ))}
      </ul>
    </div>
  );
};
