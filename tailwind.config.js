/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: true,
  theme: {
    extend: {
      animation: {
        "pop-up": "popUp 1s ease-in-out",
        "bg-fade": "bgFade 3s ease-in-out forwards",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        "border-animate": "borderAnim 3s infinite ease-in-out",
      },
      keyframes: {
        popUp: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bgFade: {
          "0%": { backgroundColor: "rgba(255, 255, 255, 0)" },
          "100%": { backgroundColor: "rgba(0, 0, 0, 0.9)" }, // 这里是目标颜色
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        borderAnim: {
          "0%, 100%": { borderColor: "rgba(79, 70, 229, 1)" }, // 深色
          "50%": { borderColor: "rgba(199, 210, 254, 1)" }, // 浅色
        },
      },
    },
  },
  plugins: [],
};
