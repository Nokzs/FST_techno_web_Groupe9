import { redirect } from "react-router-dom";
import { authRouterContext } from "../context/authRouterContext";
import type { UserID } from "../types/user";
import type { RouterContextProvider } from "react-router";
import { getConnectedUser } from "../api/user/getConnectedUser";

export async function authMiddleware({
  context,
}: {
  context: RouterContextProvider;
}): Promise<void> {
  const user: UserID | null = await getConnectedUser();
  if (!user) {
    throw redirect("/login");
  }
  context.set(authRouterContext, user);
}
