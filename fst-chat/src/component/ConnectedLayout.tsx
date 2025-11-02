import { Outlet, useLoaderData } from "react-router-dom";

export function ConnectedLayout() {
  const user = useLoaderData();
  return (
    <div className="bg-main min-h-screen">
      <Outlet context={user} />
    </div>
  );
}
