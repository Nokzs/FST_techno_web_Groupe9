import { redirect } from "react-router-dom";
import { authRouterContext } from "../../context/authRouterContext";
import { getConnectedUser } from "../../api/user/getConnectedUser";
import { socket } from "../../socket";
/**
 * Middleware pour protéger les routes nécessitant une authentification.
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page de login.
 * Si l'utilisateur est connecté, son ID est stocké dans le contexte de la route.
 */
export async function authMiddleware({ context }) {
  const userAuth = await getConnectedUser();
  if (!userAuth) {
    throw redirect("/login");
  } else {
    if (!socket.connected) {
      socket.connect();
    }
  }
  context.set(authRouterContext, userAuth);
}
