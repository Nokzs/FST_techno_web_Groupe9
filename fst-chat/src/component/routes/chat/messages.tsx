// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { getSignedUrl } from "../../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../../api/storage/uploadFile";
import { type MessageFile, type Message } from "../../../types/messageFileType";
import { MessageItem } from "./MessageItem";
import { socket } from "../../../socket";
import { NavLink, useLoaderData } from "react-router";
import { LanguageSwitcher } from "../../ui/languageSwitcher";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";
import { ChatBotWindow } from "../../ui/ChatBotWindows";
import type { MessageLoaderData } from "../../../loaders/messageLoader";
import { PinnedMessages } from "./PinnedMessages";
import { useMessages } from "../../../hooks/useMessages";
type MessagesProps = {
  channelId: string;
  prefetchData: MessageLoaderData;
};
export function Messages({ channelId, prefetchData }: MessagesProps) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const { messages, pinnedMessage } = useMessages(
    channelId,
    topRef,
    messagesEndRef,
    prefetchData,
    setReplyMessage,
    user,
    messagesRef,
  );

  /*Résumé du UseEffect : récupération du profil utilisateur au montage du composant.*/
  useEffect(() => {
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile(abortSignal);
        setUser(profile);
      } catch (err) {
        console.error("Erreur récupération user :", err);
      }
    };
    fetchUser();
    return () => {
      abortController.abort();
    };
  }, []);

  const addMessage = async (text: string, files: File[]) => {
    if (!user.id || !channelId) return;

    const messagesFiles: MessageFile[] = [];

    // Cas avec fichiers
    if (files.length > 0) {
      const optimisticMessage = {
        senderId: user.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: [] as MessageFile[],
        sending: true,
      };

      // Envoi de la version finale avec fichiers
      const finalMessage = {
        senderId: user.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: messagesFiles,
        sending: false,
      };
      // Envoi de la version optimistique
      socket.emit("sendMessage", optimisticMessage, (message: Message) => {
        finalMessage._id = message._id;
      });

      // Upload des fichiers
      await Promise.all(
        files.map(async (file) => {
          const { signedUrl, path } = await getSignedUrl(
            `file_${uuidv4()}`,
            "messageFile",
            channelId,
          );

          await uploadFile(file, signedUrl, true);

          const { publicUrl } = await getMessageFilePublicUrl(path, channelId);
          messagesFiles.push({
            originalName: file.name + ".gz",
            url: publicUrl,
            mimetype: "application/gzip",
            originalMymeType: file.type,
          });
        }),
      );

      socket.emit("updateMessageFiles", finalMessage);
    } else {
      // Cas sans fichiers : envoi direct
      const message = {
        senderId: user.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: [],
        sending: false,
      };
      socket.emit("sendMessage", message);
    }
  };

  if (!channelId) {
    return <></>;
  }

  return (
    <>
      <ChatBotWindow channelId={channelId} userId={user} />
      <div className="h-screen flex flex-col p-10 w-full relative">
        <LanguageSwitcher className="absolute top-0 right-0 mt-4" />

        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          <NavLink to="/servers">
            {"<-"}
            {t("tchat.tchatRoom")}
          </NavLink>
        </h1>

        {/* Bouton pour ouvrir le drawer des messages épinglés */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2 bg-yellow-400 text-black rounded mb-2 self-start"
        >
          📌 Messages épinglés
        </button>

        {/* Liste des messages */}
        <div
          key={channelId}
          ref={messagesRef}
          className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 messages-container"
        >
          <div ref={messagesEndRef} />
          {messages.slice().map((msg, index: number) => (
            <MessageItem
              key={msg._id + index}
              messageRef={messagesRef!}
              message={msg}
              isOwner={msg.senderId._id === user?.id}
              currentUserId={user?.id}
              channelId={channelId!}
              onReply={setReplyMessage}
            />
          ))}
          {messages.length > 0 && (
            <div
              id="TopRef"
              ref={topRef}
              style={{ minHeight: "1px", visibility: "hidden" }}
            />
          )}
        </div>

        <ChatInput
          sendMessage={addMessage}
          replyMessage={replyMessage}
          onReply={setReplyMessage}
        />

        {/* Drawer des messages épinglés */}
        {drawerOpen && (
          <div className="fixed top-0 right-0 w-80 h-full bg-gray-900 text-white shadow-lg z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="font-bold text-lg">📌 Messages épinglés</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-white text-lg font-bold"
              >
                X
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PinnedMessages messages={pinnedMessage} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
