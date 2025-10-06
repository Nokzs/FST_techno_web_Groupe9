/**
 * @description : Contexte pour l'authentification dans le routeur.
 */
import { createContext } from "react-router";
import { type UserID } from "../types/user";

export const authRouterContext = createContext<UserID | null>();
