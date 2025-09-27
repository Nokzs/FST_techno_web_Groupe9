import { useDarkMode } from "../../hooks/useDarkMode";
import { AnimatePresence, motion } from "framer-motion";
export function ToggleDarkMode() {
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <button
      className="rounded-2xl overflow-hidden w-12 h-12 flex items-center justify-center"
      onClick={() => setDarkMode((prev) => !prev)}
    >
      <AnimatePresence mode="sync">
        {darkMode ? (
          <motion.div
            key="moon"
            initial={{ y: -50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            className="absolute"
          >
            <span className="text-3xl">🌙</span>
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute"
          >
            <span className="text-3xl">☀️</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
