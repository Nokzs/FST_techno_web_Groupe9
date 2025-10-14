import type { Message } from "./messageFileType";
import { FilePreview } from "./FilePreview";

interface MessageProps {
  currentUserId: string;
  message: Message;
}

export function MessageItem({ message, currentUserId }: MessageProps) {
  const isOwnMessage = message.senderId === currentUserId;

  const date = new Date(message.createdAt);
  const formattedDate = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex flex-col gap-1 my-2 max-w-[75%] ${
        isOwnMessage ? "self-end items-end" : "self-start items-start"
      }`}
    >
      {/* Bulle de message */}
      <div
        className={`p-3 rounded-2xl shadow-sm flex flex-col ${
          isOwnMessage
            ? "bg-green-500 text-white rounded-br-none"
            : "bg-blue-500 text-white rounded-bl-none"
        }`}
      >
        {/* Texte du message */}
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

        {/* Nom + heure à l'intérieur de la bulle */}
        <div
          className={`text-xs mt-2 opacity-80 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          <span className="font-medium">{message.senderId}</span> —{" "}
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
