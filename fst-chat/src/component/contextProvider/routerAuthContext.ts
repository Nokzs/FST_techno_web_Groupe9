import { createContext } from "react-router";
import { type User } from "../../types/user";
export const authRouterContext = createContext<User | null>(null);
