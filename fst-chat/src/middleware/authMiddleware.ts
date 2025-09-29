import { redirect } from "react-router-dom";
import { authRouterContext } from "../context/authRouterContext";
interface RouterContextMinimal {
  set(key: any, value: any): void;
  get(key: any): any;
}
export function authMiddleware({
  context,
}: {
  context: RouterContextMinimal;
}): void {
  //const user =  await getConnectedUser()
  if (!user) {
    throw redirect("/login");
  }
}
