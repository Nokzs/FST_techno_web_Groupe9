import { Outlet, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProfilTabSwitcher } from "../ProfilTabSwitcher";
import { SvgTextFit } from "../../../ui/SvgTextFit";

export function ProfilLayout() {
  const user = useOutletContext();
  const { t } = useTranslation();

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header / Titre */}
      <div className="flex flex-col">
        <div className="max-h-25 min-h-10 dark:bg-[#0d0f2a] dark:border-2 border-gray-700 rounded-2xl shadow-md p-4 w-full flex items-center justify-center">
          <SvgTextFit
            text={t("profile.config")}
            fill="text-gray-900"
            darkFill="white"
            maxFontSize={50}
            className="h-full"
          />
        </div>
        <ProfilTabSwitcher />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 w-full flex justify-center">
        <div className="flex-1 flex flex-col w-full  ">
          <div
            id="card"
            className="flex-1 flex flex-col w-full mx-auto border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-[#0d0f2a] p-4"
          >
            <Outlet context={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
