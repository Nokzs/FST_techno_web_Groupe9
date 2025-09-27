import { type ReactNode, useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { darkModeContext } from "../../context/DarkModeContext";
type darkModeProviderProps = {
  children: ReactNode;
};

export function DarkModeProvider({
  children,
}: darkModeProviderProps): ReactNode {
  const preferMedia = useMediaQuery(
    {
      query: "(prefers-color-scheme:dark)",
    },
    undefined,
    (prefersDark) => {
      setDarkMode(prefersDark);
    },
  );

  const [darkMode, setDarkMode] = useState<boolean>(preferMedia);

  useEffect(() => {
    console.log(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <darkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </darkModeContext.Provider>
  );
}
