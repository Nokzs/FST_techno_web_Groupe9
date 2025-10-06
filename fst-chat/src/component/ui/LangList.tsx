import { useEffect, useState } from "react";
export function LangList() {
  const [lang, setLang] = useState<Set<string> | null>(null);
  useEffect(() => {
    const abortController = new AbortController();
    fetch("https://restcountries.com/v3.1/all?fields=languages", {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((countries) => {
        // Extraire toutes les langues
        const langs = countries.flatMap((c) =>
          c.languages ? Object.values(c.languages) : [],
        );
        const uniqueLangs = new Set<string>(langs);
        setLang(uniqueLangs);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      });
    return () => {
      abortController.abort();
    };
  });
  return <div>LangList component</div>;
}
