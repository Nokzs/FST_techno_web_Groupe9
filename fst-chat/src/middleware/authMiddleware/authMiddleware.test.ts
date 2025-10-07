import { authMiddleware } from "./authMiddleware";
import { redirect } from "react-router-dom";
import { describe, expect, it, vi, type Mock } from "vitest";
import { getConnectedUser } from "../../api/user/getConnectedUser";
import { RouterContextProvider } from "react-router";
import { authRouterContext } from "../../context/authRouterContext";

vi.mock("../../api/user/getConnectedUser", () => ({
  getConnectedUser: vi.fn(),
}));

describe("authMiddleware", () => {
  it("redirige vers /login si aucun utilisateur", async () => {
    // arrange
    (getConnectedUser as Mock).mockResolvedValueOnce(null);

    const context = new RouterContextProvider(); // ou ton RouterContextProvider fake
    const args = { context };

    // act + assert
    await expect(
      authMiddleware(args as { context: RouterContextProvider }),
    ).rejects.toEqual(redirect("/login"));
  });

  test("stocke l’utilisateur dans le contexte si connecté", async () => {
    const fakeUser = { id: "123" };
    (getConnectedUser as Mock).mockResolvedValueOnce(fakeUser);

    const context = new RouterContextProvider();
    const args = { context };

    await expect(
      authMiddleware(args as { context: RouterContextProvider }),
    ).resolves.toBeUndefined();

    expect(context.get(authRouterContext)).toEqual(fakeUser);
  });

  it("gère les erreurs de l'API correctement", async () => {
    (getConnectedUser as Mock).mockRejectedValueOnce(new Error("API Error"));

    const context = new RouterContextProvider();
    const args = { context };

    await expect(
      authMiddleware(args as { context: RouterContextProvider }),
    ).rejects.toThrow("API Error");
  });

  it("ne redirige pas si l’utilisateur est déjà connecté", async () => {
    const fakeUser = { id: "456" };
    (getConnectedUser as Mock).mockResolvedValueOnce(fakeUser);

    const context = new RouterContextProvider();
    const args = { context };

    await authMiddleware(args as { context: RouterContextProvider });

    expect(context.get(authRouterContext)).toEqual(fakeUser);
  });
});
