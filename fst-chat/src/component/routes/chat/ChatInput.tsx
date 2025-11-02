import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from "react";
import EmojiPicker, {
  type EmojiClickData,
  SkinTones,
} from "emoji-picker-react";
import { AudioRecorder } from "./AudioRecorder";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../../utils/cn";
import type { Message } from "../../../types/messageFileType";
import { useTranslation } from "react-i18next";
import { socket } from "../../../socket";
type ChatInputProps = {
  sendMessage: (message: string, files: File[]) => void;
  replyMessage?: Message;
  onReply: React.Dispatch<React.SetStateAction<Message | undefined>>;
  channelId?: string;
};

export function ChatInput({
  sendMessage,
  replyMessage,
  onReply,
  channelId,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageRef = useRef<string>("");
  const filesLengthRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);

  // ref de la derniere fois qu'on a notifier le serv
  const typingLastEmitRef = useRef<number>(0);
  // ref du dernier timer d'inactivité
  const typingStopTimerRef = useRef<number | null>(null);

  // notifie le serveur qu on est en train d ecrire si ça fait 800ms (pour pas sur-appeler le serv)
  const emitTypingThrottled = () => {
    if (!channelId) return;
    const now = Date.now();
    if (now - typingLastEmitRef.current >= 800) {
      socket.emit("typing", { channelId });
      typingLastEmitRef.current = now;
    }
  };

  // lance un timer qui notifie qu on arrete d'ecrire si inactif pendant 2 secs
  const scheduleStopTyping = () => {
    if (!channelId) return;
    // annule l ancien timer
    if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = window.setTimeout(() => {
      socket.emit("stopTyping", { channelId });
      typingStopTimerRef.current = null;
    }, 2000);
  };


  // force le stopTyping au serveur (quand le message est envoyé)
  const stopTypingNow = () => {
    if (!channelId) return;
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    socket.emit("stopTyping", { channelId });
  };

  useEffect(() => {
    // on arrete d'écrire si on quitte le salon
    return () => {
      if (channelId) {
        if (typingStopTimerRef.current) {
          window.clearTimeout(typingStopTimerRef.current);
          typingStopTimerRef.current = null;
        }
        socket.emit("stopTyping", { channelId });
      }
    };
  }, [channelId]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    messageRef.current = e.target.value;
    setMessage(e.target.value);
    
    emitTypingThrottled();
    scheduleStopTyping();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    filesLengthRef.current += e.target.files.length;
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleRemoveFile = (index: number) => {
    filesLengthRef.current -= 1;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    console.log("envoi du message :", message);
    if (!message.trim() && files.length === 0) return;
    sendMessage(message, files);
    setMessage(() => "");
    onReply?.(undefined);
    filesLengthRef.current = 0;
    setFiles([]);
    stopTypingNow();
  };
  const onStopRecording = (file: File) => {
    console.log("je recois le fichier audio");
    setFiles((prev) => [...prev, file]);
    filesLengthRef.current += 1;
  };
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    filesLengthRef.current += dropped.length;
    if (dropped.length > 0) setFiles((prev) => [...prev, ...dropped]);
  };

  return (
    <div
      className="p-7 border-t flex flex-col gap-2 relative "
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {replyMessage && (
        <div className="p-2 mb-1 rounded bg-gray-200 w-auto dark:bg-gray-700 text-sm flex justify-between items-center">
          <div className="flex flex-col">
            <span className="truncate">
              Répond à:{replyMessage.senderId.pseudo}
            </span>
            <span>
              {replyMessage.content.length > 50
                ? replyMessage.content.slice(0, 50) + "..."
                : replyMessage.content}
            </span>
          </div>

          <button
            onClick={() => onReply(undefined)}
            className="text-red-500 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-200/30 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none" />
      )}

      {/* Aperçu des fichiers */}
      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {files.map((file, i) => (
            <div key={i} className="relative h-20 flex-shrink-0">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg shadow"
                />
              ) : file.type.startsWith("audio/") ? (
                <audio
                  controls
                  src={URL.createObjectURL(file)}
                  className=" rounded-lg shadow"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg shadow text-xs text-center p-1">
                  📎{" "}
                  {file.name.length > 10
                    ? file.name.slice(0, 10) + "..."
                    : file.name}
                </div>
              )}
              <button
                onClick={() => handleRemoveFile(i)}
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center flex-row gap-2 relative ">
        {/* Bouton fichier */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xl"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Bouton Emoji */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50 shadow-lg">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                lazyLoadEmojis
                width={300}
                height={400}
                defaultSkinTone={SkinTones.MEDIUM_LIGHT}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* Champ de texte */}
        <input
          type="text"
          value={message}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onChange={handleTextChange}
          placeholder="Écris un message..."
          className="w-full border-2 dark:border-white border-black  rounded-lg px-3 py-2 focus:outline-none text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-75"
        />

        {/* Conteneur pour superposer le bouton et l'enregistreur */}
        <div
          ref={recordRef}
          className={cn(
            "relative flex justify-center h-12 rounded-lg overflow-hidden",
          )}
        >
          <AnimatePresence mode="wait">
            {message.trim() || files.length > 0 ? (
              <motion.div
                key="send-button"
                onClick={handleSend}
                className=" text-white w-[100px] h-full text-center rounded-lg whitespace-nowrap flex justify-center items-center"
                initial={{ opacity: 0, y: "-100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-100%" }}
                transition={{ duration: 0.05, ease: "easeInOut" }}
                onAnimationStart={() => {
                  // background actif dès le début de l'animation
                  if (recordRef.current)
                    recordRef.current.classList.add("bg-green-700");
                }}
              >
                {t("tchat.send")}
              </motion.div>
            ) : (
              <motion.div
                key="audio-recorder"
                className=" h-full"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.05, ease: "easeInOut" }}
                onAnimationStart={() => {
                  if (recordRef.current)
                    recordRef.current.classList.add("bg-green-700");
                }}
                onAnimationComplete={() => {
                  console.log(messageRef.current);
                  // quand le micro est complètement visible, on retire le background
                  if (recordRef.current && !messageRef.current.trim()) {
                    recordRef.current.classList.remove("bg-green-700");
                  }
                }}
              >
                <AudioRecorder onStop={onStopRecording} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
