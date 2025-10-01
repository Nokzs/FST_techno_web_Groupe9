import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function NotConnectedLayout() {
  console.log("je suis dans not connected layout");
  return (
    <div className="overflow-x-hidden">
      <NavBar />
      <Outlet />
    </div>
  );
}
