// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";
import { socket } from "../../../socket";
import { useParams } from "react-router";

interface Message {
  channelId: string;
  content: string;
  createdAt: string;
  senderId: string;
  updatedAt: string;
}

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
        const res = await fetch("http://localhost:3000/messages/userId", {
          credentials: "include", // le cookie est envoyé
        });
        const data = await res.json();
        if (data.userId) setUserId(data.userId);
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
    socket.emit("joinChannelRoom", channelId);

    socket.emit("getMessages", channelId, (messages: Message[]) => {
      setMessages(messages);
      setLoading(false);
      scrollToBottom();
    });

    socket.on("newMessage", (message: Message) => {
      if (message.channelId === channelId) {
        console.log("Nouveau message reçu :", message);
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    return () => {
      socket.emit("leaveRoom", channelId);
      socket.off("newMessage");
    };
  }, [channelId]);

  // 🔹 Envoi d’un message
  const addMessage = (text: string) => {
    if (!userId || !channelId) return;

    const newMessage = {
      senderId: userId,
      content: text,
      channelId,
    };

    socket.emit("sendMessage", newMessage);
    console.log("Message envoyé :", newMessage);
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

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2">
        {messages
          .slice()
          .reverse()
          .map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-xl max-w-xs ${
                msg.senderId === userId
                  ? "self-end bg-green-500"
                  : "self-start bg-blue-500"
              } text-white`}
            >
              <div>{msg.content}</div>
              <div className="text-xs flex justify-between mt-1 opacity-80">
                <span>{msg.senderId}</span>
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone d’envoi */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Écrire un message..."
          className="flex-1 p-2 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          id="messageInput"
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-xl"
          onClick={() => {
            const input = document.getElementById(
              "messageInput",
            ) as HTMLInputElement;
            if (input.value.trim()) {
              addMessage(input.value);
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
