import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
export function NotConnectedLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
