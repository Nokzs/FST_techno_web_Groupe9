import { Outlet } from "react-router";

export function ProfilLayout() {
  return (
    <>
      <ProfilTabSwitcher />
      <Outlet />
    </>
  );
}
