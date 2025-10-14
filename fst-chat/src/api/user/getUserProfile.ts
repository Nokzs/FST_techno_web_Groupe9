import type { User, UserID } from "../../types/user";

export async function getUserProfile(
  userID: UserID | null,
): Promise<User | null> {
  if (!userID) {
    return null;
  }
  const API_URL = import.meta.env.VITE_API_URL;
  const req = await fetch(`${API_URL}/user/profile/${userID.id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!req.ok) {
    console.log("code ", req.status, "message : ", req.statusText);
    return null;
  }
  const profile = await req.json();
  console.log("profile", profile);
  return profile;
}
