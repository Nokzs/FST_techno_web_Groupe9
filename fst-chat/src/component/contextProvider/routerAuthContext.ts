import { createContext } from "react-router";
export const authRouterContext = createContext<User | null>(null);
