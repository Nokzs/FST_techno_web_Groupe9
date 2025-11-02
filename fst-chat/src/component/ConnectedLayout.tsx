import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "../socket";

export function ConnectedLayout() {
  useEffect(() => {
    try {
      if (!socket.connected) socket.connect();
    } catch { /* ignore */ }
    return () => {
      try {
        if (socket.connected) socket.disconnect();
      } catch { /* ignore */ }
    };
  }, []);
  return (
    <div className="bg-main h-screen">
      <Outlet />
    </div>
  );
}
