import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendQuestion } from "../../api/message/chatBot/sendQuestion";
import { useTranslation } from "react-i18next";
type ChatBotWindowType = {
  channelId: string;
  userId: string;
};
export type messageBotType = {
  from: "user" | "bot";
  text: string;
};
const translateMessage = (text: string, lang: string): string => {
  // Fonction fictive de traduction
  return text;
};
/**
 * Composant ChatBotWindow
 * Affiche une fenêtre de chat flottante avec un chatbot.
 *
 * Props:
 * - channelId: ID du canal de chat.
 * - userId: ID de l'utilisateur.
 */
export function ChatBotWindow({ channelId, userId }: ChatBotWindowType) {
  const [open, setOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const [messages, setMessages] = useState<messageBotType[]>();
  const [input, setInput] = useState("");

  const parseInput = async (text: string): Promise<string> => {
    if (text.startsWith("/question ")) {
      const question = text.replace("/question ", "").trim();
      return await sendQuestion(question, userId, channelId);
    }
    return "no command";
  };

  const updateMessagesInStorage = (
    messages: messageBotType[],
    newMessages: messageBotType,
  ) => {
    const messageAfterUpdate = [newMessages, ...messages];
    localStorage.setItem(
      "botMessages" + channelId,
      JSON.stringify(messageAfterUpdate),
    );
    return messageAfterUpdate;
  };
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: messageBotType = { from: "user", text: input };
    setMessages((prev) => updateMessagesInStorage(prev, userMessage));
    const answer = await parseInput(input);
    setTimeout(() => {
      setMessages((prev) =>
        updateMessagesInStorage(prev, { from: "bot", text: answer }),
      );
    }, 500);
    setInput("");
  };

  return (
    <AnimatePresence mode="popLayout">
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {/* Bouton flottant */}
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ ease: "easeInOut", type: "tween", duration: 0.05 }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
            aria-label="Ouvrir le chat"
          >
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
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-[90vw] sm:w-80 md:w-96 lg:w-1/4 h-96 bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden box-border"
          >
            {/* En-tête */}
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
              <span className="font-semibold">ChatBot</span>
              <button
                onClick={() => setOpen(false)}
                className="hover:text-gray-200 transition"
                aria-label="Fermer le chat"
              >
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
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 flex flex-col-reverse bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-full break-words text-sm ${
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
            <div className="p-3 border-t border-gray-200 flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Écris un message..."
                className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 break-words"
              />
              <motion.button
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex-shrink-0"
              >
                Envoyer
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
