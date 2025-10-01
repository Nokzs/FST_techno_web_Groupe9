import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./component/routes";
import { Messages } from "./component/routes/messages";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import "./i18n/i18n.js";
import { ConnectedLayout } from "./component/ConnectedLayout.js";
import { ProfilLayout } from "./component/routes/profil/ProfilLayout.js";
import { profilLoader } from "./loaders/profilLoader.js";
import { authMiddleware } from "./middleware/authMiddleware/authMiddleware.js";
import { notAuthMiddleware } from "./middleware/authMiddleware/notAuthMiddleware.js";
const routes = [
  {
    Component: NotConnectedLayout,
    middleware: [notAuthMiddleware],
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
  {
    Component: ConnectedLayout,
    middleware: [authMiddleware],
    children: [
      {
        path: "/profil",
        loader: profilLoader,
        Component: ProfilLayout,
      },
      {
        path: "/messages",
        Component: Messages,
      },
    ],
  },
];
console.log("je suis dans le main");
const router = createBrowserRouter(routes);
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <DarkModeProvider>
      <RouterProvider router={router} />
    </DarkModeProvider>
  </StrictMode>,
);
