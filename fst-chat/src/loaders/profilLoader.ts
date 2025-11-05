import { redirect, type LoaderFunction } from "react-router-dom";
import { getUserProfile } from "../api/user/getUserProfile";
import type { User, UserID } from "../types/user";
import { authRouterContext } from "../context/authRouterContext";

export const profilLoader: LoaderFunction = async (data): Promise<User> => {
  const userID: UserID | null = data.context.get(authRouterContext);

  const user: User | null = await getUserProfile();
  if (!user) {
    throw redirect("/login");
  }
  return { ...user, ...userID };
};
