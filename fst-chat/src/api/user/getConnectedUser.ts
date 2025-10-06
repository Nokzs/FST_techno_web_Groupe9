/**
 * @Interroge le serveur afin de récupérer l'utiliisateur connecté.
 *
 * @returns L'utilisateur connecté ou null si non connecté .
 */

import type { UserID } from "../../types/user";

export async function getConnectedUser(): Promise<UserID | null> {
  //ToDo : renvoyer l'utilisateur connecté une fois
  const user = { id: "2" };

  return user || null;
}
