import { redirect } from "react-router-dom";
import type { UserID } from "../../types/user";

export async function notAuthMiddleware() {
  //const userId: UserID | null = await getConnectedUser();
  const userId: UserID | null = null;
  if (userId) {
    throw redirect("/messages");
  }
}
