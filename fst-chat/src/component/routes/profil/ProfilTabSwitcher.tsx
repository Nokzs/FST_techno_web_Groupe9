import { NavLink } from "react-router-dom";
import { cn } from "../../../utils/cn";

export const ProfilTabSwitcher = () => {
  const link = ["/general", "/Profil"];
  return (
    <div className="  ml-30 h-min mt-5 flex flex-col items-center w-min  border-2 border-black  bg-red-100">
      {link.map((el) => (
        <NavLink
          key={el}
          to={el}
          className={cn(
            " flex-1 w-full p-5 dark:text-white dark:text-black  hover:bg-green-600 h-full",
          )}
        >
          {el}
        </NavLink>
      ))}
    </div>
  );
};
