import { redirect } from "react-router-dom";
import { authRouterContext } from "../../context/authRouterContext";
import type { UserID } from "../../types/user";
import { getConnectedUser } from "../../api/user/getConnectedUser";

export async function authMiddleware({ context }) {
  const userId: UserID | null = await getConnectedUser();
  console.log("userId dans le middleware", userId);
  if (!userId) {
    throw redirect("/login");
  }

  context.set(authRouterContext, userId);
}
