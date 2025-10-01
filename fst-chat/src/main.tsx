import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./component/routes";
import { MessagesPage } from "./component/routes/messagePageTest";
import { Messages } from "./component/routes/messages";
import { NotConnectedLayout } from "./component/NotConnectedLayout";
import { DarkModeProvider } from "./component/contextProvider/DarkModeContextProvider";
import "./i18n/i18n.js";
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
