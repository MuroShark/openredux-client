import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeContextType = {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({ isDark: true, setIsDark: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};