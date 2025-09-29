import { createContext } from "react";
export type darkModeContextType = {
  darkMode: boolean;
  changeDarkMode: () => void;
};

export const darkModeContext = createContext<darkModeContextType | null>(null);
