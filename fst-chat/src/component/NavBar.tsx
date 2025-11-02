import { useState, type ReactElement } from "react";
import { cn } from "../utils/cn";
import { Link } from "react-router-dom";
import { ToggleDarkMode } from "./ui/ToggleDarkMode";
import { LanguageSwitcher } from "./ui/languageSwitcher";
import Hamburger from "hamburger-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { useTranslation } from "react-i18next";

/** * Barre de navigation responsive avec options de connexion, d'inscription,
 * de changement de langue et de mode sombre.
 * Affiche un menu hamburger sur les petits écrans.
 * @return {ReactElement} Composant NavBar
 */

export function NavBar(): ReactElement {
  const [show, setShow] = useState(false);
  const { darkMode } = useDarkMode();
  const { t } = useTranslation();
  return (
    <>
      <div className={cn("lg:hidden absolute right-0 mr-5")}>
        {!show && (
          <Hamburger
            toggled={show}
            toggle={setShow}
            size={20}
            direction="right"
            duration={0.2}
            distance="lg"
            rounded
            label="Show menu"
            color={darkMode ? "#ffffff" : "#000000"}
            easing="ease-in"
          />
        )}
      </div>
      <nav
        className={cn(
          // Position
          "fixed mr-2 right-0 top-0 mt-10 h-[60px] ",
          "bg-transparent hidden lg:block",
        )}
      >
        <div className=" flex-row transition-transform flex gap-10 justify-center items-center">
          <LanguageSwitcher />
          <ToggleDarkMode />
          <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl hover:shadow-[9px_14px_38px_5px_#48bb78,-11px_3px_4px_0px_#00000024] hover:scale-105 transition-all delay-20">
            <Link to="/login">{t("homePage.signin")}</Link>
          </button>
          <button className="bg-green-600 hover:shadow-2x shover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl hover:shadow-[9px_14px_38px_5px_#48bb78,-11px_3px_4px_0px_#00000024] hover:scale-105 transition-all delay-20">
            <Link to="/register">{t("homePage.signup")}</Link>
          </button>
        </div>
      </nav>

      <nav
        className={cn(
          "fixed right-0 top-0 h-screen lg:hidden",
          "bg-transparent transition-colors  duration-1000",
          "transition-transform duration-500",
          // States
          show ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="pt-10 flex relative p-5 lg:flex-row delay-500 transition-transform flex-col-reverse gap-10 justify-center items-center">
          <div className="lg:hidden absolute top-0 right-0">
            <Hamburger
              toggled={show}
              toggle={setShow}
              size={20}
              direction="right"
              duration={0.2}
              distance="lg"
              rounded
              label="Show menu"
              color={darkMode ? "#ffffff" : "#000000"}
              easing="ease-in"
              className="lg:hidden"
            />
          </div>
          <LanguageSwitcher />
          <ToggleDarkMode />
          <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl hover:shadow-[9px_14px_38px_5px_#48bb78,-11px_3px_4px_0px_#00000024] hover:scale-105 transition-all delay-20">
            <Link to="/login">{t("homePage.signin")}</Link>
          </button>
          <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl hover:shadow-[9px_14px_38px_5px_#48bb78,-11px_3px_4px_0px_#00000024] hover:scale-105 transition-all delay-20">
            <Link to="/register">{t("homePage.signup")}</Link>
          </button>
        </div>
      </nav>
    </>
  );
}
