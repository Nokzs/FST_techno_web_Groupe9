import { type ReactElement } from "react";
import { Link } from "react-router-dom";
import { ToggleDarkMode } from "./ui/ToggleDarkMode";
import { LanguageSwitcher } from "./ui/languageSwitcher";
export function NavBar(): ReactElement {
  return (
    <nav className="flex absolute right-0 top-0 m-8 flex-row align-center gap-x-10 dark:text-white text-gray-900">
      <LanguageSwitcher />
      <ToggleDarkMode />
      <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl hover:shadow-[9px_14px_38px_5px_#48bb78,-11px_3px_4px_0px_#00000024] hover:scale-105 transition-all delay-20">
        <Link to="/login">Connexion</Link>
      </button>
      <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl hover:shadow-[9px_14px_38px_5px_#48bb78,-11px_3px_4px_0px_#00000024] hover:scale-105 transition-all delay-20">
        <Link to="/register">Inscription</Link>
      </button>
    </nav>
  );
}
