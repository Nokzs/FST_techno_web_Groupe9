// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./chat/ChatInput";
import { getSignedUrl } from "../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../api/storage/uploadFile";
import { type MessageFile, type Message } from "./chat/messageFileType";
import { MessageItem } from "./chat/MessageItem";
const apiUrl = import.meta.env.VITE_API_URL;

export function Messages() {
  // listes des messages
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);

  // useRef pour garder une référence à un élément DOM
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automatique apres un message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`${apiUrl}/messages`);
        const data = await res.json();
        setMessages(data);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const addMessage = async (text: string, files: File[]) => {
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
      content: text,
      channelId: "1",
    };

    try {
      const res = await fetch(apiUrl + "/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMessage, files: messagesFiles }),
      });
      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error("Erreur lors de l'ajout du message: ", error);
    }
  };

  //JSX
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-800 dark:text-white">
        Chargement des messages...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Salon de discussion
      </h1>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2">
        {messages
          .slice()
          .reverse()
          .map((msg, index: number) => (
            <MessageItem key={index} message={msg} currentUserId={"1"} />
          ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput sendMessage={addMessage} />
    </div>
  );
}
