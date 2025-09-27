import { useTranslation } from "react-i18next";
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  console.log(i18n.languages);
  return <></>;
}
