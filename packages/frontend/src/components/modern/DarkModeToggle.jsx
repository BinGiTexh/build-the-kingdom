import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

const DarkModeToggle = () => {
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    updateTheme(savedTheme);
  }, []);

  const updateTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateTheme(newTheme);
  };

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop }
  ];

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <div className="md:hidden">
        <button
          onClick={() => handleThemeChange(isDark ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Desktop Theme Selector */}
      <div className="hidden md:block">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex space-x-1">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.id;
            
            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                aria-label={`Switch to ${themeOption.label} theme`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{themeOption.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Theme Indicator */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-ping"></div>
      </div>
    </div>
  );
};

export default DarkModeToggle;
