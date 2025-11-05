import { redirect } from "react-router-dom";
import type { UserID } from "../../types/user";
import { getConnectedUser } from "../../api/user/getConnectedUser";
import { socket } from "../../socket";
export async function notAuthMiddleware() {
  const userId: UserID | null = await getConnectedUser();
  // const userId = null;
  if (userId) {
    if (!socket.connected) {
      socket.connect();
    }
    throw redirect("/servers");
  }
}
