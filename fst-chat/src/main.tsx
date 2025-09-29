import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./component/routes";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import { authMiddleware } from "./middleware/authMiddleware.js";
import "./i18n/i18n.js";

const router = createBrowserRouter([
  {
    Component: NotConnectedLayout,
    middleware: [authMiddleware],
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
  <StrictMode>
    <DarkModeProvider>
      <RouterProvider router={router} />
    </DarkModeProvider>
  </StrictMode>,
);
