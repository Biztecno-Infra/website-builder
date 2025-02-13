import { ThemeProvider } from "styled-components";
import { ReactNode } from "react";
import { Theme } from "types";
import { defaultTheme } from "@utils/index";


interface ThemeProviderProps {
  children: ReactNode;
  theme: Theme;
}

export const CustomThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  const mergedTheme = { ...defaultTheme, ...theme };
  return <ThemeProvider theme={mergedTheme}>{children}</ThemeProvider>;
};

export default CustomThemeProvider;