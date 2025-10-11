import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Messages } from "./api/messages/messages.js";
import { HomePage, LoginPage, RegisterPage } from "./component/routes";
import "./i18n/i18n.js";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import { ConnectedLayout } from "./component/ConnectedLayout.js";
import { ProfilLayout } from "./component/routes/profil/ProfilLayout.js";
import { profilLoader } from "./loaders/profilLoader.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { Servers } from "./api/servers/servers.js";



const routes = [
  {
    Component: NotConnectedLayout,
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
      {
        path:"/servers",
        Component: Servers
      }
    ],
  },
  {
    Component: ConnectedLayout,
    children: [
      {
        path: "/profil",
        middleware: [authMiddleware],
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
