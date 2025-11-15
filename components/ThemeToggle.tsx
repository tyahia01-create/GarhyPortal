import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
    asSidebarItem?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ asSidebarItem = false }) => {
    const { theme, toggleTheme } = useTheme();

    if (asSidebarItem) {
        return (
            <button
                onClick={toggleTheme}
                className="flex items-center justify-start w-full p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? (
                    <>
                        <i className="fas fa-moon w-6 text-center"></i>
                        <span className="mr-4">الوضع الليلي</span>
                    </>
                ) : (
                    <>
                        <i className="fas fa-sun w-6 text-center"></i>
                        <span className="mr-4">الوضع النهاري</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition-all duration-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`التحويل إلى ${theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}`}
        >
            {theme === 'light' ? (
                <i className="fas fa-moon text-xl"></i>
            ) : (
                <i className="fas fa-sun text-xl text-yellow-400"></i>
            )}
        </button>
    );
};