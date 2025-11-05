import { useEffect, useState } from "react";
import type { User } from "../../types/user";
export function LangList({
  user,
  ref,
  handleModif,
}: {
  user: User;
  ref?: React.Ref<HTMLSelectElement>;
  handleModif?: () => void;
}) {
  const [lang, setLang] = useState<Set<string> | null>(null);
  //pour eviter le linter chiant en attendant que je finisse le composant
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
  }, []);
  return (
    <div className="flex flex-col mt-5 items-center">
      {lang && (
        <>
          {" "}
          <label className="dark:text-white text-dark">
            Choisir une langue :
          </label>
          <select
            onChange={() => handleModif && handleModif()}
            defaultValue={user.language}
            ref={ref}
            className="border p-2 rounded  text-dark dark:text-white"
          >
            {[...lang]
              .filter((el) => !el.toUpperCase().includes("SIGN"))
              .map((el) => (
                <option key={el} value={el} className="text-dark bg-blue-950">
                  {el}
                </option>
              ))}
          </select>
        </>
      )}
    </div>
  );
}
