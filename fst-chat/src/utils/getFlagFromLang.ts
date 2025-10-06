/**
 * @description Description de l'utilitaire ou de sa fonction principale.
 */
export function getFlagFromLang(lang: string) {
  // On prend seulement les 2 premières lettres
  const code = lang.slice(0, 2).toUpperCase();
  // Transforme chaque lettre en Regional Indicator Symbol
  return code.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0)),
  );
}
