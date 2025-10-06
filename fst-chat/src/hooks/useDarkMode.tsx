import { useContext } from "react";
import { type darkModeContextType } from "../context/DarkModeContext";
import { darkModeContext } from "../context/DarkModeContext";

/** * Hook personnalisé pour accéder au contexte du mode sombre.
 * @returns Le contexte du mode sombre, incluant l'état actuel et la fonction pour le modifier.
 * @throws Erreur si utilisé en dehors du fournisseur de contexte.
 */
export function useDarkMode(): darkModeContextType {
  const context = useContext(darkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used inside darkModeProvider");
  }
  return context;
}
