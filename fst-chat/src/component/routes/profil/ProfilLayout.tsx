import { Outlet } from "react-router";
import { ProfilTabSwitcher } from "./ProfilTabSwitcher.js";
export function ProfilLayout() {
  console.log("je suis dans le profil layout");
  return (
    <div className="h-full w-full flex flex-row ">
      <ProfilTabSwitcher />
      <div className="bg-red-200 h-full flex-1">
        <Outlet />
      </div>
    </div>
  );
}
