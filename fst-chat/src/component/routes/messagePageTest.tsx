// component/routes/MessagesPage.tsx
import { useState, useRef } from "react";

interface Message {
    id: number;
    sender: string;
    text: string;
    time: string;
}

export function MessagesPage() {
    // le state
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: "Léa", text: "Salut ! Comment ça va ?", time: "10:05" },
        { id: 2, sender: "Alex", text: "Très bien, et toi ?", time: "10:06" },
        { id: 3, sender: "María", text: "Salut ! Comment ça va ?", time: "10:07" },
        { id: 4, sender: "Yuki", text: "Comment ça va ?", time: "10:08" },
    ]);

    // useRef pour garder une référence à un élément DOM
    const messagesEndRef = useRef<HTMLDivElement | null>(null);


    // Scroll automatique vers le bas quand un nouveau message arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    const addMessage = (text: string, sender: string) => {
        const newMessage: Message = {
            id: messages.length + 1,
            sender,
            text,
            time: new Date().toLocaleTimeString().slice(0, 5),
        };

        setMessages([...messages, newMessage])
        setTimeout(scrollToBottom, 50); // Scroll vers le bas après ajout (50 ms)
    };


    // JSX
    return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4">

      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Salon de discussion
      </h1>

      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2">
        {messages
          .slice() // copie du tableau pour ne pas muter le state
          .reverse()
          .map((msg) => (
            <div
              key={msg.id} // clé unique pour react
              className={`p-2 rounded-xl max-w-xs ${
                msg.sender === "Léa" ? "self-start bg-blue-500" : "self-end bg-green-500"
              } text-white`}
            >
              <div>{msg.text}</div>

              <div className="text-xs flex justify-between mt-1">
                <span>{msg.sender}</span>
                <span>{msg.time}</span>
              </div>
            </div>
          ))}
        {/* Div vide vers lequel scroller */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Écrire un message..."
          className="flex-1 p-2 rounded-xl border dark:border-gray-700"
          id="messageInput"
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-xl"
          onClick={() => {
            const input = document.getElementById("messageInput") as HTMLInputElement;
            if (input.value.trim()) {
              addMessage(input.value, "Moi");
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