import type { User } from "../../types/user";

export async function getUserProfile(
  signal?: AbortSignal,
): Promise<User | null> {
  const API_URL = import.meta.env.VITE_API_URL;
  let req;
  if (signal) {
    req = await fetch(`${API_URL}/user/profile/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      signal: signal,
    });
  } else {
    req = await fetch(`${API_URL}/user/profile/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  if (!req.ok) {
    console.log("code ", req.status, "message : ", req.statusText);
    return null;
  }
  const profile = await req.json();
  return profile;
}
