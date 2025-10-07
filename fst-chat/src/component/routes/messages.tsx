// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Message {
  channelId: string;
  content: string;
  createdAt: string;
  senderId: string;
  updatedAt: string;
}

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
        const res = await fetch(`${apiUrl}messages`);
        const data = await res.json();
        setMessages(data);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const addMessage = async (text: string, senderId: string) => {
    const newMessage = {
      senderId,
      content: text,
      channelId: "1",
    };

    try {
      const res = await fetch(apiUrl + "messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      const savedMessage = await res.json();
      console.log(savedMessage);
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
          .map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-xl max-w-xs ${
                msg.senderId === "1"
                  ? "self-end bg-green-500"
                  : "self-start bg-blue-500"
              } text-white`}
            >
              <div>{msg.content}</div>
              <div className="text-xs flex justify-between mt-1">
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

      {/* Input */}
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
              addMessage(input.value, "1"); // backend
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
