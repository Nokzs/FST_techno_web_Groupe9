import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage, LoginPage, RegisterPage } from "./component/routes";
import "./i18n/i18n.js";
import { MessagesPage } from "./component/routes/messagePageTest";
import { Messages } from "./component/routes/messages";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import { ConnectedLayout } from "./component/ConnectedLayout.js";
import { ProfilLayout } from "./component/routes/profil/ProfilLayout.js";
import { profilLoader } from "./loaders/profilLoader.js";
import { authMiddleware } from "./middleware/authMiddleware.js";



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
        path: "/messages-test",
        Component: MessagesPage,
      },
      {
        path: "/messages",
        Component: Messages,
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
