import { redirect } from "react-router-dom";
import { authRouterContext } from "../../context/authRouterContext";
import type { UserID } from "../../types/user";
import { getConnectedUser } from "../../api/user/getConnectedUser";
/**
 * Middleware pour protéger les routes nécessitant une authentification.
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page de login.
 * Si l'utilisateur est connecté, son ID est stocké dans le contexte de la route.
 */
export async function authMiddleware({ context }) {
  const userAuth: UserID | null = await getConnectedUser();
  console.log("userId dans le middleware", userAuth);
  if (!userAuth) {
    throw redirect("/login");
  }
  context.set(authRouterContext, userAuth);
}
