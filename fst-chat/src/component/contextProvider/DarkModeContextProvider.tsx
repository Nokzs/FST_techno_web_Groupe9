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
      localStorage.setItem("darkMode", prefersDark ? "true" : "false");
      setDarkMode(prefersDark);
    },
  );
  console.log("mon navigateur prefere", preferMedia);

  const darkModeStorage: string | null = localStorage.getItem("darkMode");
  console.log("mon application connait ", darkModeStorage, "pour mon darkMode");
  const [darkMode, setDarkMode] = useState<boolean>(
    (!darkModeStorage && preferMedia) || darkModeStorage === "true",
  );

  console.log("le résultat est ", darkMode);
  const changeDarkMode = () => {
    setDarkMode((darkMode) => {
      console.log(!darkMode);
      localStorage.setItem("darkMode", !darkMode ? "true" : "false");
      return !darkMode;
    });
  };
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <darkModeContext.Provider value={{ darkMode, changeDarkMode }}>
      {children}
    </darkModeContext.Provider>
  );
}
