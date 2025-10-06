import { Outlet, useLoaderData } from "react-router";
import { ProfilTabSwitcher } from "../ProfilTabSwitcher";
import { SvgTextFit } from "../../../ui/SvgTextFit";
import { useTranslation } from "react-i18next";

export function ProfilLayout() {
  const user = useLoaderData();
  const { t } = useTranslation();
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col">
        <div className=" max-h-25 min-h-10 dark:bg-[#0d0f2a] dark:border-2 border-gray-700  rounded-2xl shadow-md p-4 w-full flex flex-row items-center justify-around">
          <div className="flex-1 flex h-full justify-center flex-row">
            <SvgTextFit
              text={t("profile.config")}
              fill="text-gray-900"
              darkFill="white"
              maxFontSize={50}
              className=" h-full anchor"
            />
          </div>
        </div>
        <ProfilTabSwitcher />
      </div>
      <Outlet context={user} />
    </div>
  );
}
