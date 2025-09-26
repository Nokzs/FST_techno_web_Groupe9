import { useContext } from "react";
import { type darkModeContextType } from "../context/DarkModeContext";
import { darkModeContext } from "../context/DarkModeContext";
export function useDarkMode(): darkModeContextType {
  const context = useContext(darkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used inside darkModeProvider");
  }
  return context;
}
