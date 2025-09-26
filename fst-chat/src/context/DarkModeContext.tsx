import { type Dispatch, type SetStateAction, createContext } from "react";
export type darkModeContextType = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};

export const darkModeContext = createContext<darkModeContextType | null>(null);
