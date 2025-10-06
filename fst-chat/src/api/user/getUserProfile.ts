import type { User, UserID } from "../../types/user";

export async function getUserProfile(
  userID: UserID | null,
): Promise<User | null> {
  if (!userID) {
    return null;
  }
  const profile = {
    id: userID,
    email: "toto@gmail.com",
    pseudo: "toto",
    password: "123456",
    createdAt: new Date(),
    isAdmin: false,
    language: "fr",
  };
  return profile;
}
