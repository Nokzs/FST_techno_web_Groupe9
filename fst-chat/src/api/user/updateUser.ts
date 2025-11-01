import type { User } from "../../types/user";

const API_URL: string =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

// Deux variantes possibles pour l'identifiant côté front
type WithId = User & { id: string };
type With_Id = User & { _id: string };

function getUserId(u: User): string {
  const asWithId = u as Partial<WithId>;
  if (typeof asWithId.id === "string" && asWithId.id.length > 0) {
    return asWithId.id;
  }
  const asWith_Id = u as Partial<With_Id>;
  if (typeof asWith_Id._id === "string" && asWith_Id._id.length > 0) {
    return asWith_Id._id;
  }
  throw new Error("updateUser: user.id (ou _id) est requis");
}

/**
 * Met à jour l'utilisateur côté backend et renvoie l'utilisateur mis à jour.
 * On envoie uniquement les champs attendus (pas de any).
 */
export const updateUser = async (user: User): Promise<User> => {
  const id = getUserId(user);

  // Construire un payload typé, sans any (ajoute ici les champs modifiables réels)
  const payload: Partial<User> = {
    pseudo: user.pseudo,
    email: user.email,
    language: (user as Partial<User>).language,
    // ajoute d'autres champs éditables si votre API les accepte
  };

  const res = await fetch(`${API_URL}/user/${id}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`updateUser: HTTP ${res.status}`);
  }

  // On suppose que l'API renvoie l'utilisateur mis à jour
  return (await res.json()) as User;
};
