import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
export function NotConnectedLayout() {
  return (
    <div className="overflow-x-hidden">
      <NavBar />
      <Outlet />
    </div>
  );
}
