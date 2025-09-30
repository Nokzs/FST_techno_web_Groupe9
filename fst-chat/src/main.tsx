import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./component/routes";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import "./i18n/i18n.js";
import { ConnectedLayout } from "./component/ConnectedLayout.js";
import { ProfilLayout } from "./component/routes/profil/ProfilLayout.js";
import { profilLoader } from "./loaders/profilLoader.js";
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
  {
    Component: ConnectedLayout,
    //middleware:authMiddleware,
    children: [
      {
        path: "/profil",
        Component: ProfilLayout,
        loader: profilLoader,
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
