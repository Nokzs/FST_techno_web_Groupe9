import type { User } from "../../types/user";

export const getPublicUrl = async (
  filePath: string,
  user: User,
): Promise<{ publicUrl: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return fetch(`${apiUrl}/user/${user.id}/ProfilePictureUrl`, {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json());
};
