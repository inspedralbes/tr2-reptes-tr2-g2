import type { Config } from "tailwindcss";
import { THEME } from "@iter/shared";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.tsx",
    "../../packages/shared/index.ts",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        action: "var(--action)",
        consorci: {
          darkBlue: THEME.colors.primary,
          lightBlue: THEME.colors.secondary,
          actionBlue: THEME.colors.tertiary,
          lightGray: THEME.colors.gray,
          pinkRed: THEME.colors.accent,
          beige: THEME.colors.beige,
          yellow: THEME.colors.yellow,
          bgGray: THEME.colors.bgGray,
          secondaryBg: THEME.colors.secondaryBg,
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
