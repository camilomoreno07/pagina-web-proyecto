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
        primary: '#036672', // Define tu color personalizado
        'primary-dark': '#024a54', // Define una variante más oscura
      },
    },
  },
  plugins: [],
};
export default config;
