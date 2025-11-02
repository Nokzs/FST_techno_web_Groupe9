// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect, useMemo } from "react";
import { ChatInput } from "./ChatInput";
import { getSignedUrl } from "../../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../../api/storage/uploadFile";
import { type MessageFile, type Message } from "./messageFileType";
import { MessageItem } from "./MessageItem";
import { socket } from "../../../socket";
import { NavLink, useParams } from "react-router";
import { LanguageSwitcher } from "../../ui/languageSwitcher";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";
import ISO6391 from "iso-639-1";


export function Messages() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const preferredLanguageCode = useMemo(() => {
    if (!user?.language) {
      return null;
    }
    const trimmed = user.language.trim();
    if (!trimmed) {
      return null;
    }
    const lower = trimmed.toLowerCase();
    if (ISO6391.validate(lower)) {
      return lower;
    }
    const base = lower.split("-")[0];
    if (base && ISO6391.validate(base)) {
      return base;
    }
    const fromName = ISO6391.getCode(trimmed);
    if (fromName) {
      return fromName.toLowerCase();
    }
    return null;
  }, [user?.language]);

  const [showTranslations, setShowTranslations] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }
    const stored = window.localStorage.getItem("chat:showTranslations");
    return stored !== "false";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("chat:showTranslations", String(showTranslations));
    }
  }, [showTranslations]);

  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );
  const { channelId } = useParams<{ channelId: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automatique aprÃ¨s chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error("Erreur rÃ©cupÃ©ration user :", err);
      }
    };
    fetchUser();
  }, []);

  // ðŸ”¹ Connexion socket + rÃ©cupÃ©ration des messages
  useEffect(() => {
    if (!channelId) return;

    // rejoindre la "room" du channel
    console.log("je rentre dans la room");
    socket.emit("joinChannelRoom", channelId);

    socket.emit("getMessages", channelId, (messages: Message[]) => {
      console.log("RÃ©cupÃ©ration des messages pour le channel :", channelId);
      console.log("Messages reÃ§us :", messages);
      setMessages(messages);
      console.log("Messages chargÃ©s :", messages);
      setLoading(false);
      scrollToBottom();
    });

    socket.on("newMessage", (message: Message) => {
      console.log("Ã‰vÃ©nement newMessage reÃ§u :", message);
      if (message.channelId === channelId) {
        console.log("Nouveau message reÃ§u :", message);
        setMessages((prev) => [message, ...prev]);
        scrollToBottom();
      }
    });
    socket.on("newReactions", (updatedMessage: Message) => {
      console.log(
        "Message mis Ã  jour avec de nouvelles rÃ©actions :",
        updatedMessage,
      );
      setMessages((messages) =>
        messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    });
    return () => {
      console.log("je quitte la room");
      socket.emit("leaveRoom", channelId);
      socket.off("newMessage");
    };
  }, [channelId]);

  // ðŸ”¹ Envoi dâ€™un message
  const addMessage = async (text: string, files: File[]) => {
    if (!user.id || !channelId) return;
    const messagesFiles: MessageFile[] = [];
    if (files.length > 0) {
      // pour chaque image, on demande un lien d'upload Ã  l'aide de la fonction getPresignedUrl
      await Promise.all(
        files.map(async (file) => {
          const { signedUrl, path } = await getSignedUrl(
            `file_${uuidv4()}`,
            "messageFile",
            "1",
          );

          await uploadFile(file, signedUrl);

          const { publicUrl } = await getMessageFilePublicUrl(path, "1");

          messagesFiles.push({
            originalName: file.name,
            url: publicUrl,
            mimetype: file.type,
          });
        }),
      );
    }
    const newMessage = {
      senderId: user.id,
      channelId: channelId,
      content: text,
      receiverId: replyMessage ? replyMessage.senderId._id : undefined,
      replyMessage: replyMessage || null,
    };

    socket.emit("sendMessage", { ...newMessage, files: messagesFiles });
    console.log("Message envoyÃ© :", newMessage);
  };

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-800 dark:text-white">
        {t("tchat.loadingMessages")}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <NavLink to="/servers">{"<-"}</NavLink>
          {t("tchat.tchatRoom")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTranslations((prev) => !prev)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-pressed={showTranslations}
          >
            {showTranslations ? "Désactiver la traduction" : "Activer la traduction"}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 messages-container">
        <div ref={messagesEndRef} />
        {messages.slice().map((msg) => (
          <MessageItem
            key={msg._id}
            message={msg}
            currentUserId={user.id}
            channelId={channelId!}
            onReply={setReplyMessage}
            preferredLanguageCode={preferredLanguageCode ?? undefined}
            showTranslations={showTranslations}
          />
        ))}
      </div>
      <ChatInput
        sendMessage={addMessage}
        replyMessage={replyMessage}
        onReply={setReplyMessage}
      />
    </div>
  );
}
