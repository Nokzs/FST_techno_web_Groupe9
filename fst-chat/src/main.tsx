import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage, LoginPage, RegisterPage } from "./component/routes";
import "./i18n/i18n.js";
import { Messages } from "./component/routes/messages";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import { ConnectedLayout } from "./component/ConnectedLayout.js";
import { ProfilLayout } from "./component/routes/profil/layout/ProfilLayout.js";
import { profilLoader } from "./loaders/profilLoader.js";
import { authMiddleware } from "./middleware/authMiddleware/authMiddleware.js";
import { notAuthMiddleware } from "./middleware/authMiddleware/notAuthMiddleware.js";
import { Profil } from "./component/routes/profil/subRoutes/Profil.js";
import { Compte } from "./component/routes/profil/subRoutes/Compte.js";
/* Objets concernant les routes utilisé par les application toutes les routes en dessous la route authmiddleware sont protégé alors
celles en dessous de notauthmiddleware sont accessible uniquement si l'utilisateur n'est pas connecté */

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
        Component: LoginPage,
      },
      {
        path: "/register",
        Component: RegisterPage,
      },
    ],
  },
  {
    Component: ConnectedLayout,
    middleware: [authMiddleware],
    children: [
      {
        loader: profilLoader,
        Component: ProfilLayout,
        children: [
          {
            path: "/profil",
            Component: Profil,
          },
          {
            path: "/compte",
            Component: Compte,
          },
        ],
      },
      {
        path: "/messages",
        Component: Messages,
      },
    ],
  },
];
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
