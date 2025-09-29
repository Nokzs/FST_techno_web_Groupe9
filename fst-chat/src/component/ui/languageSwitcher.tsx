import { useTranslation } from "react-i18next";
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const languages = ["fr", "en"];

  return (
    <div className="flex flex-col justify-center align-center group relative uppercase px-5">
      <p className="cursor-pointer text-center  dark:text-white  text-black">
        {i18n.resolvedLanguage}
      </p>

      <div className="absolute top-full transition-all opacity-0 duration-500 left-0  mx-auto w-max flex-col  shadow-lg rounded-md group-hover:flex group-hover:opacity-100">
        {languages
          .filter((el) => {
            return el !== i18n.resolvedLanguage;
          })
          .map((lang) => {
            return (
              <div
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className="px-4 py-2  cursor-pointer text-center bg-black dark:bg-blue-900 rounded-2xl border-black border-2 flex flex-row text-white"
              >
                <p>{lang}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
