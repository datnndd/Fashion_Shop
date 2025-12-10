/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                'brand': {
                    black: '#111111',
                    white: '#FFFFFF',
                    beige: '#D7C4A8',
                    gray: '#9A9A9A',
                    navy: '#1E335A',
                    olive: '#6B7A4C',
                },
                'surface': {
                    main: '#F7F7F7',
                    card: '#FFFFFF',
                    border: '#EEEEEE',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
