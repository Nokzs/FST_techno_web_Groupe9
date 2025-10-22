import { useDarkMode } from "../../../../hooks/useDarkMode";
import { cn } from "../../../../utils/cn";
export function Theme() {
  const { darkMode, changeDarkMode } = useDarkMode();
  const themes = [
    {
      id: "light",
      name: "Clair",
      primary: "bg-gradient-to-r from-white via-gray-100 to-gray-200", // gris clair / blanc
      textColor: "#1f2937",
    },
    {
      id: "dark",
      name: "Sombre",
      primary: "bg-gradient-to-r from-[#010221] via-[#080c3b] to-[#080c3f]", // bleu très foncé
      textColor: "#e2e8f0",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-center text-gray-600 dark:text-gray-300">
        Sélection du thème
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <label
            key={theme.id}
            htmlFor={theme.id}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-transparent
              transition-all hover:scale-[1.02] hover:border-gray-400
              has-[input:checked]:border-blue-500 has-[input:checked]:ring-2 has-[input:checked]:ring-blue-300
            `}
          >
            <input
              type="radio"
              name="theme"
              defaultChecked={
                darkMode ? theme.id === "dark" : theme.id === "light"
              }
              id={theme.id}
              className="peer absolute opacity-0"
              onChange={changeDarkMode}
            />

            <div
              className={cn(
                "flex flex-col items-center justify-center h-28 rounded-2xl transition-all",
                theme.primary,
              )}
              style={{
                color: theme.textColor,
              }}
            >
              <span className="text-base font-semibold">{theme.name}</span>
              <span className="text-xs opacity-75">
                Thème {theme.name.toLowerCase()}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
