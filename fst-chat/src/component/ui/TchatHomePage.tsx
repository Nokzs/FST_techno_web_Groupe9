import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
type messagesProp = {
  id: number;
  sender: string;
  text: string;
  time: string;
};
type tchatHomePageProp = {
  messages: messagesProp[];
};

export function TchatHomePage({ messages }: tchatHomePageProp): ReactNode {
  return (
    <div className="overflow-hidden transition-all delay-200 bg-white rounded-3xl flex-1 break-all flex flex-col-reverse border-8 gap-1 pt-2 pb-2 border-black dark:border-none">
      <AnimatePresence>
        {messages.map((el) => (
          <motion.div
            key={el.id}
            initial={{
              x: el.sender === "Léa" ? "-100%" : "100%",
              opacity: 0,
            }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className={`p-2 rounded-2xl ${
              el.sender === "Léa"
                ? "self-start bg-blue-700"
                : "self-end bg-green-700"
            } text-white`}
          >
            <div>{el.text}</div>
            <div className="flex justify-between text-xs">
              <p>{el.sender}</p>
              <p>{el.time}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
