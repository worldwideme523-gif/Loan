/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/components/pages/**/*.{js,jsx}",
    "./src/components/ui/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors if needed
      },
      spacing: {
        // Custom spacing if needed
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}
