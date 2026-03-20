import { createContext } from "react";

export const ThemeContext = createContext({
  mode: "dark",
  toggleTheme: () => {},
});
