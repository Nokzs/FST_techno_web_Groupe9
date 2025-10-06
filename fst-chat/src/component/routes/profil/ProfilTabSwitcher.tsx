import { NavLink } from "react-router-dom";
import { cn } from "../../../utils/cn";

export const ProfilTabSwitcher = () => {
  const link = ["/profil", "/compte", "/theme"];
  return (
    <div className=" h-min  flex flex-row items-center w-full justify-around  dark:bg-[#0d0f2a] dark:border-b dark:border-gray-700 bg-gray-50 border-b border-gray-200  ">
      {link.map((el) => (
        <NavLink
          key={el}
          to={el}
          className={cn(
            " flex-1 w-full p-5 h-full text-center active:text-indigo-600 active:dark:text-indigo-400 border-b-2 active:border-indigo-600 active:dark:border-b-indigo-400  hover:dark:border-b-indigo-400 hover:border-b-indigo-600   dark:text-gray-300 text-gray-700 hover:text-gray-900 hover:dark:text-gray-100 px-4 py-2",
          )}
        >
          {el.substring(1).toUpperCase()}
        </NavLink>
      ))}
    </div>
  );
};
