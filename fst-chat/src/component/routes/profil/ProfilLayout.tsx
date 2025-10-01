import { Outlet } from "react-router";
import { ProfilTabSwitcher } from "./ProfilTabSwitcher.js";
export function ProfilLayout() {
  console.log("je suis dans le profil layout");
  return (
    <div className="flex flex-col items-center justify-start text-white bg-red-700">
      <ProfilTabSwitcher />
      <Outlet />
    </div>
  );
}
