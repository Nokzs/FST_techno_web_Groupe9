import { Outlet } from "react-router-dom";

export function ConnectedLayout() {
  return (
    <div className="overflow-x-hidden">
      <Outlet />
    </div>
  );
}
