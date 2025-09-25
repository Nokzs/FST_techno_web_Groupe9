import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./component/routes" 
import { NotConnectedLayout } from "./component/NotConnectedLayout";
const router = createBrowserRouter([
  {
    Component: NotConnectedLayout,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        path: "/login",
        Component: HomePage,
      },
      {
        path: "/register",
        Component: HomePage,
      },
    ],
  },
]);

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
