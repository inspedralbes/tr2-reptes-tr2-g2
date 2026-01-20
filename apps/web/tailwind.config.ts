import type { Config } from "tailwindcss";

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
          darkBlue: "#00426B",
          lightBlue: "#4197CB",
          actionBlue: "#0775AB",
          lightGray: "#CFD2D3",
          pinkRed: "#F26178",
          beige: "#E0C5AC",
          bgGray: "#F2F2F3",
          secondaryBg: "#EAEFF2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
