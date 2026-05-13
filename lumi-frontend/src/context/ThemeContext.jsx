import { createContext, useContext, useState, useEffect } from "react";

const THEMES = ["pink", "lavender", "peach", "mint", "night"];

/* ═══════════════════════════════════════════════════════════════════
   ОНОВЛЕНІ ТЕМИ — Більш професійний вигляд
═══════════════════════════════════════════════════════════════════ */

const THEME_META = {
  pink:      { icon: "🌸", label: "Рожева",    iconColor: "#F28BAD" },
  lavender:  { icon: "☁️", label: "Лавандова", iconColor: "#9B72D4" },
  peach:     { icon: "🫧", label: "Персикова", iconColor: "#F0935A" },
  mint:      { icon: "✨", label: "М'ятна",    iconColor: "#3CB87A" },
  night:     { icon: "🌙", label: "Нічна",     iconColor: "#9050C8" },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("lumi_theme") || "pink"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "pink") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("lumi_theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, THEMES, THEME_META }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
