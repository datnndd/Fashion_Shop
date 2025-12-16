import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Default theme: Neon Pulse (Magenta)
    const [theme, setThemeState] = useState({
        name: 'Neon Pulse',
        accentColor: '#d411d4', // Magenta
        secondaryColor: '#c992c9', // Light magenta
        borderColor: '#673267', // Dark magenta border
        panelBgColor: '#482348', // Darker magenta panel
        gradientOverlay: 'radial-gradient(at 0% 0%, hsla(300, 35%, 20%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(280, 30%, 18%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(290, 25%, 12%, 1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(310, 40%, 10%, 1) 0, transparent 50%)',
    });

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    // Update CSS variables when theme changes
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.accentColor);
        // We can add more CSS variables here if needed
        // For the gradient background, we'll likely pass it to the App component's style
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
