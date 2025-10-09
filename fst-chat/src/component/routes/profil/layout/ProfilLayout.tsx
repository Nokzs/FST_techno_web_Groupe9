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
      <div className="flex-1 w-full flex justify-center">
        <div className="rounded-2xl shadow-md p-4 bg-white h-full border border-gray-200 w-full dark:bg-[#0d0f2a] dark:border dark:border-gray-700">
          <div
            id="card"
            className="bg-white dark:bg-[#0d0f2a] shadow-md m-auto h-full border-2 border-black rounded-2xl w-[80%] flex-1 flex flex-col items-center gap-2"
          >
            <Outlet context={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
