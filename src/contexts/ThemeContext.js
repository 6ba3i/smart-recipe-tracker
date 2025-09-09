/**
 * Theme Context for Managing Light/Dark Mode
 * 
 * Features:
 * - Light and dark theme support
 * - Persistent theme preference
 * - System theme detection
 * - Custom color schemes
 * - Bootstrap theme integration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  // Theme configurations
  const themes = {
    light: {
      name: 'light',
      displayName: 'Light',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textMuted: '#6c757d',
        border: '#dee2e6',
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      bootstrap: {
        'data-bs-theme': 'light'
      },
      chart: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        gridColor: '#f0f0f0',
        axisColor: '#cccccc'
      }
    },
    dark: {
      name: 'dark',
      displayName: 'Dark',
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0',
        light: '#f8f9fa',
        dark: '#212529',
        background: '#212529',
        surface: '#2d3436',
        text: '#ffffff',
        textMuted: '#adb5bd',
        border: '#495057',
        shadow: 'rgba(0, 0, 0, 0.3)'
      },
      bootstrap: {
        'data-bs-theme': 'dark'
      },
      chart: {
        backgroundColor: '#2c2c2c',
        textColor: '#ffffff',
        gridColor: '#404040',
        axisColor: '#666666'
      }
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
    setupSystemThemeListener();
  }, []);

  // Update document attributes when theme changes
  useEffect(() => {
    updateDocumentTheme();
  }, [theme]);

  const initializeTheme = () => {
    try {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme-preference');
      
      // Detect system preference
      const systemTheme = detectSystemTheme();
      setSystemPreference(systemTheme);

      // Use saved theme or fall back to system preference
      const initialTheme = savedTheme || systemTheme;
      setTheme(initialTheme);
      
      console.log('Theme initialized:', {
        saved: savedTheme,
        system: systemTheme,
        selected: initialTheme
      });
    } catch (error) {
      console.error('Error initializing theme:', error);
      setTheme('light'); // Fallback to light theme
    }
  };

  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const setupSystemThemeListener = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        const newSystemPreference = e.matches ? 'dark' : 'light';
        setSystemPreference(newSystemPreference);
        
        // Auto-switch if user hasn't set a manual preference
        const savedTheme = localStorage.getItem('theme-preference');
        if (!savedTheme) {
          setTheme(newSystemPreference);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup listener
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  };

  const updateDocumentTheme = () => {
    const currentTheme = themes[theme];
    
    if (typeof document !== 'undefined') {
      // Update document attributes for Bootstrap
      Object.entries(currentTheme.bootstrap).forEach(([attr, value]) => {
        document.documentElement.setAttribute(attr, value);
      });

      // Update CSS custom properties
      const root = document.documentElement;
      Object.entries(currentTheme.colors).forEach(([property, value]) => {
        root.style.setProperty(`--color-${property}`, value);
      });

      // Update body class for additional styling
      document.body.className = document.body.className
        .replace(/theme-\w+/g, '')
        .concat(` theme-${theme}`)
        .trim();

      console.log('Document theme updated to:', theme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  const changeTheme = (newTheme) => {
    if (!themes[newTheme]) {
      console.error('Invalid theme:', newTheme);
      return;
    }

    setTheme(newTheme);
    
    try {
      localStorage.setItem('theme-preference', newTheme);
      console.log('Theme changed to:', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const resetToSystemTheme = () => {
    try {
      localStorage.removeItem('theme-preference');
      setTheme(systemPreference);
      console.log('Theme reset to system preference:', systemPreference);
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  };

  const getCurrentThemeConfig = () => {
    return themes[theme];
  };

  const getColorValue = (colorName) => {
    return themes[theme].colors[colorName] || colorName;
  };

  const isDarkMode = () => {
    return theme === 'dark';
  };

  const isLightMode = () => {
    return theme === 'light';
  };

  // CSS variables helper
  const getCSSVariables = () => {
    const currentTheme = themes[theme];
    const cssVars = {};
    
    Object.entries(currentTheme.colors).forEach(([property, value]) => {
      cssVars[`--color-${property}`] = value;
    });

    return cssVars;
  };

  // Bootstrap utility classes based on theme
  const getBootstrapClasses = () => {
    return {
      bg: isDarkMode() ? 'bg-dark' : 'bg-light',
      text: isDarkMode() ? 'text-light' : 'text-dark',
      card: isDarkMode() ? 'bg-dark text-light' : 'bg-light text-dark',
      navbar: isDarkMode() ? 'navbar-dark bg-dark' : 'navbar-light bg-light',
      table: isDarkMode() ? 'table-dark' : 'table-light',
      border: isDarkMode() ? 'border-secondary' : 'border-light'
    };
  };

  // Chart theme configuration
  const getChartTheme = () => {
    return themes[theme].chart;
  };

  // Animation preferences (some users prefer reduced motion)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const value = {
    // Current state
    theme,
    systemPreference,
    isDarkMode: isDarkMode(),
    isLightMode: isLightMode(),
    prefersReducedMotion,

    // Theme data
    themes,
    currentTheme: getCurrentThemeConfig(),
    colors: themes[theme].colors,
    
    // Actions
    toggleTheme,
    changeTheme,
    resetToSystemTheme,
    
    // Utilities
    getColorValue,
    getCSSVariables,
    getBootstrapClasses,
    getChartTheme,
    
    // Available themes
    availableThemes: Object.keys(themes),
    themeOptions: Object.values(themes).map(t => ({
      value: t.name,
      label: t.displayName
    }))
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for theme-aware styling
export const useThemeStyles = () => {
  const { colors, isDarkMode, getBootstrapClasses } = useTheme();
  
  return {
    colors,
    isDarkMode,
    classes: getBootstrapClasses(),
    
    // Common style objects
    cardStyle: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: colors.border
    },
    
    inputStyle: {
      backgroundColor: colors.background,
      color: colors.text,
      borderColor: colors.border
    },
    
    buttonStyle: (variant = 'primary') => ({
      backgroundColor: colors[variant],
      borderColor: colors[variant]
    }),
    
    shadowStyle: {
      boxShadow: `0 2px 4px ${colors.shadow}`
    }
  };
};

// Hook for theme-aware animations
export const useThemeAnimations = () => {
  const { prefersReducedMotion } = useTheme();
  
  return {
    prefersReducedMotion,
    
    // Animation utilities
    getTransition: (property = 'all', duration = '0.3s') => 
      prefersReducedMotion ? 'none' : `${property} ${duration} ease`,
    
    getAnimationDuration: (duration = '0.3s') => 
      prefersReducedMotion ? '0s' : duration,
    
    shouldAnimate: () => !prefersReducedMotion
  };
};