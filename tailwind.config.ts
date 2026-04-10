import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/admin/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/auth/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/dashboard/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/team/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/registration-portal/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/lib/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
