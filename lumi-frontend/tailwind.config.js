/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans:  ["'Nunito'", "sans-serif"],
      },
      colors: {
        petal:    "#FFF0F5",
        blossom:  "#FFE0EC",
        blush:    "#FFB8D4",
        rose:     "#F28BAD",
        berry:    "#C25880",
        plum:     "#7A2D52",
        wine:     "#4A1230",
        lilac:    "#EDD9F5",
        lavender: "#C9A8E8",
        border:   "#F5D4E4",
        darkBg:   "#1A0A10", 
        darkSurface: "#2D101C",
      },
    },
  },
  plugins: [],
};