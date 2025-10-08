import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
/**
 * Layout pour les utilisateurs non connectés
 * Affiche la barre de navigation et le contenu des routes enfants
 */

export function NotConnectedLayout() {
  return (
    <div className="overflow-x-hidden">
      <NavBar />
      <Outlet />
    </div>
  );
}
