// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";
import { socket } from "../../../socket";
import { useParams } from "react-router";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";

interface Message {
  channelId: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderPseudo: string;
  updatedAt: string;
}

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const { channelId } = useParams<{ channelId: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automatique après chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error("Erreur récupération user :", err);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Connexion socket + récupération des messages
  useEffect(() => {
    if (!channelId) return;

    // rejoindre la "room" du channel
    socket.emit("joinChannelRoom", channelId);

    socket.emit("getMessages", channelId, (messages: Message[]) => {
      console.log("Récupération des messages pour le channel :", channelId);
      console.log("Messages reçus :", messages);
      setMessages(messages);
      setLoading(false);
      scrollToBottom();
    });

    socket.on("newMessage", (message: Message) => {
      console.log("Événement newMessage reçu :", message);
      if (message.channelId === channelId) {
        console.log("Nouveau message reçu :", message);
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    return () => {
      socket.emit("leaveChannelRoom", channelId);
      socket.off("newMessage");
    };
  }, [channelId]);

  // 🔹 Envoi d’un message
  const addMessage = (text: string) => {
    if (!user || !channelId) return;

    const newMessage = {
      senderId: user.id,
      channelId: channelId,
      content: text,
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
                msg.senderId ===  user?.id
                  ? "self-end bg-green-500"
                  : "self-start bg-blue-500"
              } text-white`}
            >
              <div>{msg.content}</div>
              <div className="text-xs flex justify-between mt-1 opacity-80">
                <span>{msg.senderPseudo}</span>
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
