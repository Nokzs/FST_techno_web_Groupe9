import type { ClassValue } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
type messagesProp = {
  id: number;
  sender: string;
  text: string;
  time: string;
};
type tchatHomePageProp = {
  messages: messagesProp[];
  className: ClassValue | ClassValue[];
};

export function TchatHomePage({
  messages,
  className,
}: tchatHomePageProp): ReactNode {
  return (
    <div
      className={cn(
        " transition-all delay-200 p-5 bg-white overflow-hidden rounded-3xl flex-1 break-all flex flex-col-reverse border-8 gap-1 pt-2 pb-2 border-black dark:border-none",
        className,
      )}
    >
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
            className={cn(
              `p-2 rounded-2xl text-white`,
              el.sender === "Léa"
                ? "self-start bg-blue-700 ml-2"
                : "self-end bg-green-700 mr-2",
            )}
          >
            <div className="text-xs lg:text-lg">{el.text}</div>
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
