import { useState, useRef, useEffect, useCallback } from "react";
import { socket } from "../../../socket";
import { useParams } from "react-router";

interface Message {
  _id?: string;
  channelId: string;
  content: string;
  createdAt: string;
  senderId: string;
  updatedAt: string;
  originalContent?: string;
  translatedContent?: string;
  targetLanguage?: string;
  detectedLanguage?: string;
}

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const { channelId } = useParams<{ channelId: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("http://localhost:3000/messages/userId", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.userId) {
          setUserId(data.userId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur recuperation userId :", err);
        setLoading(false);
      }
    };

    void fetchUserId();
  }, []);
  useEffect(() => {
    if (!channelId || !userId) {
      return;
    }

    setLoading(true);

    const handleNewMessage = (message: Message) => {
      if (message.channelId !== channelId) {
        return;
      }
      setMessages((prev) => [...prev, message]);
    };

    socket.emit("joinChannelRoom", { channelId, userId });

    socket.emit("getMessages", channelId, (fetchedMessages: Message[]) => {
      const initialMessages = Array.isArray(fetchedMessages)
        ? fetchedMessages
        : [];
      setMessages(initialMessages);
      setLoading(false);
    });

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveChannelRoom", channelId);
      socket.off("newMessage", handleNewMessage);
    };
  }, [channelId, userId]);
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading, scrollToBottom]);
  const addMessage = (text: string) => {
    if (!userId || !channelId) {
      return;
    }

    socket.emit("sendMessage", {
      senderId: userId,
      content: text,
      channelId,
    });
  };

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

      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2">
        {messages
          .slice()
          .reverse()
          .map((msg) => {
            const key = msg._id ?? `${msg.createdAt}-${msg.senderId}`;
            const translated = msg.translatedContent ?? msg.content;
            const showOriginal =
              msg.originalContent &&
              msg.originalContent !== translated;

            const containerClasses =
              msg.senderId === userId
                ? "p-2 rounded-xl max-w-xs self-end bg-green-500 text-white"
                : "p-2 rounded-xl max-w-xs self-start bg-blue-500 text-white";

            return (
              <div key={key} className={containerClasses}>
                <div>{translated}</div>
                {showOriginal && (
                  <div className="text-xs opacity-80 italic mt-1">
                    {msg.originalContent}
                  </div>
                )}
                <div className="text-xs flex justify-between mt-1 opacity-80">
                  <span>{msg.senderId}</span>
                  <span
                    title={
                      msg.targetLanguage
                        ? `Langue cible : ${msg.targetLanguage}`
                        : undefined
                    }
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Ecrire un message..."
          className="flex-1 p-2 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          id="messageInput"
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-xl"
          onClick={() => {
            const input = document.getElementById(
              "messageInput",
            ) as HTMLInputElement | null;
            if (input && input.value.trim()) {
              addMessage(input.value.trim());
              input.value = "";
            }
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
