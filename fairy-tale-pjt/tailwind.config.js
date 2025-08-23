import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{html,js}",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                custom: {
                    jk_yellow: "#F8B300",
                    jk_light_yellow: "#FFF1CD",
                    jk_lightest_yellow: "#FFFCF5",
                    jk_dark_yellow: "#D39800",
                    jk_red: "#BD4128",
                    jk_blue: "#15478A",
                    jk_gray: "#EAEAEA",
                    jk_pink: "#FFD3D3",
                },
            },
            fontFamily: {
                sans: ["Noto Sans KR", ...defaultTheme.fontFamily.sans],
                noto: ["Noto Sans KR", "sans-serif"],
                default: ["Noto Sans KR", "sans-serif"],
            },
            dropShadow: {
                'basic': 'var(--drop-shadow-basic)',
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar')({ nocompatible: true }),
    ],
} 