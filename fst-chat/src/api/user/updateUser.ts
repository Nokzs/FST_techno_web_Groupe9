import type { User } from "../../types/user";

export const updateUser = async (user: User) => {
  const body = JSON.stringify(user);
  console.log(body);
  fetch(`${import.meta.env.VITE_API_URL}/user/update`, {
    method: "PUT",
    body: body,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
};
