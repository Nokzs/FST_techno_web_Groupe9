// fonction de test pour le middleware notAuthMiddleware
import { notAuthMiddleware } from "./notAuthMiddleware";
import { redirect } from "react-router-dom";
import { describe, expect, it, vi, type Mock } from "vitest";
import { getConnectedUser } from "../../api/user/getConnectedUser";

vi.mock("../../api/user/getConnectedUser", () => ({
  getConnectedUser: vi.fn(),
}));

describe("notAuthMiddleware", () => {
  it("redirige vers /messages si un utilisateur est connecté", async () => {
    // arrange
    const fakeUser = { id: "123" };
    (getConnectedUser as Mock).mockResolvedValueOnce(fakeUser);

    // act + assert
    await expect(notAuthMiddleware()).rejects.toEqual(redirect("/messages"));
  });

  it("ne redirige pas si aucun utilisateur n'est connecté", async () => {
    // arrange
    (getConnectedUser as Mock).mockResolvedValueOnce(null);

    // act + assert
    await expect(notAuthMiddleware()).resolves.toBeUndefined();
  });

  it("gère les erreurs de l'API correctement", async () => {
    // arrange
    (getConnectedUser as Mock).mockRejectedValueOnce(new Error("API Error"));

    // act + assert
    await expect(notAuthMiddleware()).rejects.toThrow("API Error");
  });
});
