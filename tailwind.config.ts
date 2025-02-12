import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          0: "#000000",
          10: "#001F24",
          20: "#00363D",
          30: "#004F58",
          40: "#096874",
          50: "#32818E",
          60: "#509BA8",
          70: "#6CB6C4",
          80: "#87D2E0",
          90: "#A3EEFC",
          95: "#D1F7FF",
          98: "#EDFCFF",
          100: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
