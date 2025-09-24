import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { App } from "./App";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
const router = createBrowserRouter([
  {
    Component: NotConnectedLayout,
    children: [
      {
        path: "/",
        Component: App,
      },
      {
        path: "/login",
        Component: App,
      },
      {
        path: "/register",
        Component: App,
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
