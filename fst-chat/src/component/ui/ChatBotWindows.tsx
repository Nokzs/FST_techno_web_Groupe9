import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatBotWindow() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Salut 👋 Comment puis-je t’aider aujourd’hui ?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Mock bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "C’est une bonne question !" },
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Bouton flottant */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
          aria-label="Ouvrir le chat"
        >
          {/* Icône bulle de chat en SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M20 2H4C2.9 2 2 2.9 2 4v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </motion.button>
      )}

      {/* Fenêtre du chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-80 h-96 bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          >
            {/* En-tête */}
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
              <span className="font-semibold">ChatBot</span>
              <button
                onClick={() => setOpen(false)}
                className="hover:text-gray-200 transition"
                aria-label="Fermer le chat"
              >
                {/* Icône de fermeture en SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.7A1 1 0 0 0 5.7 7.12L10.59 12l-4.9 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.9a1 1 0 0 0 1.42-1.42L13.41 12l4.9-4.88a1 1 0 0 0-.01-1.41z" />
                </svg>
              </button>
            </div>

            {/* Zone de messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-[75%] text-sm ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Champ de saisie */}
            <div className="p-3 border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Écris un message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Envoyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
