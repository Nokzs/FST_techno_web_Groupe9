import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
/**
 * Layout pour les utilisateurs non connectés
 * Affiche la barre de navigation et le contenu des routes enfants
 */

export function NotConnectedLayout() {
  return (
    <div className="bg-main min-h-screen overflow-x-hidden">
      <Outlet />
    </div>
  );
}
