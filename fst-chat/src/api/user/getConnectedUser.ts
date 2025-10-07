/**
 * @Interroge le serveur afin de récupérer l'utiliisateur connecté.
 *
 * @returns L'utilisateur connecté ou null si non connecté .
 */

import type { UserID } from "../../types/user";

export async function getConnectedUser(): Promise<UserID | null> {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  //ToDo : renvoyer l'utilisateur connecté une fois
  const userReq = await fetch(`${apiUrl}/auth/user`, {
    credentials: "include",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!userReq.ok) {
    console.log("code ", userReq.status, "message : ", userReq.statusText);
    return null;
  }
  const userRes = await userReq.json();
  const user = userRes ? { id: userRes.sub } : null;
  console.log(user);
  return user;
}
