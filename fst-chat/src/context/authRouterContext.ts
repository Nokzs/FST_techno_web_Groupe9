/**
 * @description Description du fichier ou de ses fonctions.
 */
import { createContext } from "react-router";
import { type UserID } from "../types/user";

export const authRouterContext = createContext<UserID | null>();
