import { Outlet } from "react-router-dom";

export function ConnectedLayout() {
  return (
    <div className="bg-main min-h-screen">
      <Outlet />
    </div>
  );
}
