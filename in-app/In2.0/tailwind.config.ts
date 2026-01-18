import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0A0A0A',
                card: '#161616',
                border: 'rgba(255, 255, 255, 0.1)',
                obsidian: '#0A0A0A',
                charcoal: '#161616',
            },
            borderRadius: {
                'extra': '32px',
                'elite': '32px',
            },
            fontFamily: {
                sans: ['Inter', 'Satoshi', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                '.glass': {
                    'background': 'rgba(255, 255, 255, 0.05)',
                    'backdrop-filter': 'blur(20px)',
                    '-webkit-backdrop-filter': 'blur(20px)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                },
            });
        }),
    ],
};

export default config;
