import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendCommand } from "../../api/message/chatBot/sendCommand";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import type { User } from "../../types/user";
type ChatBotWindowType = {
  channelId: string;
  userId: User | null;
};
export type messageBotType = {
  from: "user" | "bot";
  custom: boolean;
  text: string;
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
  const { tchatBotData } = useLoaderData();
  const [messages, setMessages] = useState<messageBotType[]>(tchatBotData);
  const [input, setInput] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);
  const [useUserLanguage, setUseUserLanguage] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const localMessages = localStorage.getItem("botMessages" + channelId);
    const tchatBotData = localMessages
      ? JSON.parse(localMessages)
      : [
          {
            from: "bot",
            custom: false,
            text: "tchat.chatBot.welcomeMessage",
          },
        ];
    setMessages(tchatBotData);
  }, [channelId]);

  if (!channelId || !userId) return null;

  const parseInput = async (text: string): Promise<string> => {
    return await sendCommand(
      channelId,
      text,
      userId.id,
      userId.language,
      useUserLanguage,
    );
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

    // Ajouter le message utilisateur
    const userMessage: messageBotType = {
      from: "user",
      custom: true,
      text: input,
    };
    setMessages((prev) => updateMessagesInStorage(prev, userMessage));

    setInput("");

    // Afficher le typing avant de générer la réponse
    setTyping(true);

    // Attendre la réponse
    const answer = await parseInput(input);

    // Ajouter le message du bot
    const botMessage: messageBotType = {
      from: "bot",
      custom: true,
      text: answer,
    };
    setMessages((prev) => updateMessagesInStorage(prev, botMessage));

    // Arrêter le typing
    setTyping(false);
  };

  return (
    <div className="fixed bottom-15 right-5 z-50 flex flex-col items-end">
      <AnimatePresence initial={false} mode="sync">
        {open ? (
          <motion.div
            key="chat-window"
            layout
            initial={{ opacity: 0, y: 50, scale: 0.2 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 50,
              scale: 0.2,
              transition: { duration: 0.2 },
            }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="w-[90vw] sm:w-80 md:w-96 lg:w-90 h-96 bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden box-border"
          >
            {/* En-tête */}
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
              <span className="font-semibold">ChatBot</span>
              <button
                onClick={() => setOpen(false)}
                className="hover:text-gray-200 transition ml-2"
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
              {typing && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl bg-gray-200 text-gray-800 text-sm animate-pulse rounded-bl-none">
                    {t("tchat.chatBot.typing")}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-full break-words text-sm whitespace-pre-wrap ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {!msg.custom ? t(msg.text) : msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Champ de saisie */}
            <div className="p-3 border-t border-gray-200 flex items-center gap-2 min-w-0 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("tchat.chatBot.input.placeholder")}
                className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 break-words"
              />

              {/* Bouton de réglages ⚙ */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 transition text-sm"
                  aria-label="Paramètres de langue"
                >
                  ⚙
                </button>
                {showSettings && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border rounded shadow-lg z-50 p-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={useUserLanguage}
                        onChange={(e) => setUseUserLanguage(e.target.checked)}
                        className="accent-blue-600"
                      />
                      Répondre dans la langue de l'utilisateur
                    </label>
                  </div>
                )}
              </div>

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
        ) : (
          <motion.button
            key="chat-button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              default: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0 },
              y: { duration: 0.5 },
              scale: { duration: 0.04 },
            }}
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
      </AnimatePresence>
    </div>
  );
}
