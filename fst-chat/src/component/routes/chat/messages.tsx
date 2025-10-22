// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";
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
const apiUrl = import.meta.env.VITE_API_URL;
export function Messages() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("1");
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );
  const { channelId } = useParams<{ channelId: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automatique après chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Récupération du userId via le cookie dès le chargement
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(`${apiUrl}/messages/userId`, {
          credentials: "include", // le cookie est envoyé
        });
        const data = await res.json();
        if (data.userId) setUserId(data.userId);
        setLoading(false);
      } catch (err) {
        console.error("Erreur récupération userId :", err);
      }
    };
    fetchUserId();
  }, []);

  // 🔹 Connexion socket + récupération des messages
  useEffect(() => {
    if (!channelId) return;

    // rejoindre la "room" du channel
    console.log("je rentre dans la room");
    socket.emit("joinChannelRoom", channelId);

    socket.emit("getMessages", channelId, (messages: Message[]) => {
      setMessages(messages);
      console.log("Messages chargés :", messages);
      setLoading(false);
      scrollToBottom();
    });

    socket.on("newMessage", (message: Message) => {
      if (message.channelId === channelId) {
        console.log("Nouveau message reçu :", message);
        setMessages((prev) => [message, ...prev]);
        scrollToBottom();
      }
    });
    socket.on("newReactions", (updatedMessage: Message) => {
      console.log(
        "Message mis à jour avec de nouvelles réactions :",
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

  // 🔹 Envoi d’un message
  const addMessage = async (text: string, files: File[]) => {
    if (!userId || !channelId) return;
    const messagesFiles: MessageFile[] = [];
    if (files.length > 0) {
      // pour chaque image, on demande un lien d'upload à l'aide de la fonction getPresignedUrl
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
      senderId: userId,
      content: text,
      channelId,
      receiverId: replyMessage ? replyMessage.senderId._id : undefined,
      replyMessage: replyMessage || null,
    };

    socket.emit("sendMessage", { ...newMessage, files: messagesFiles });
    console.log("Message envoyé :", newMessage);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-800 dark:text-white">
        {t("tchat.loadingMessages")}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-10">
      <LanguageSwitcher className="absolute top-0 right-0 mt-4" />
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        <NavLink to="/servers">{"<-"}</NavLink>
        {t("tchat.tchatRoom")}
      </h1>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 messages-container">
        <div ref={messagesEndRef} />
        {messages.slice().map((msg, index: number) => (
          <MessageItem
            key={index}
            message={msg}
            currentUserId={userId}
            channelId={channelId!}
            onReply={setReplyMessage}
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
