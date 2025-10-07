import { redirect } from "react-router-dom";
import type { UserID } from "../../types/user";
import { getConnectedUser } from "../../api/user/getConnectedUser";
export async function notAuthMiddleware() {
  const userId: UserID | null = await getConnectedUser();
  if (userId) {
    throw redirect("/messages");
  }
}
