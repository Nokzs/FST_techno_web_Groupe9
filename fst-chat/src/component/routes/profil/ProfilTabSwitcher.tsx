import { NavLink } from "react-router-dom";
import { cn } from "../../../utils/cn";

export const ProfilTabSwitcher = () => {
  const link = ["/general", "/Profil"];
  return (
    <div className=" bg-red w-full">
      {link.map((el) => (
        <NavLink to={el} className={cn("border-2 border-black")}>
          {el}
        </NavLink>
      ))}
    </div>
  );
};
