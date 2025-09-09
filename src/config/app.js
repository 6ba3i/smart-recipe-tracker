/**
 * Smart Recipe Tracker - Main Application Configuration
 * This file centralizes all app configuration and ensures proper connection of all components
 */

// Import environment variables
const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  
  // Firebase Configuration
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  },
  
  // Spoonacular API Configuration
  SPOONACULAR: {
    apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
    apiSecret: import.meta.env.VITE_SPOONACULAR_API_SECRET,
    baseUrl: 'https://api.spoonacular.com',
    endpoints: {
      recipeSearch: '/recipes/complexSearch',
      recipeInfo: '/recipes/{id}/information',
      nutritionAnalysis: '/recipes/analyze',
      ingredients: '/food/ingredients/search',
      mealPlan: '/mealplanner/generate'
    },
    defaultParams: {
      addRecipeInformation: true,
      fillIngredients: true,
      addRecipeNutrition: true,
      instructionsRequired: true,
      sort: 'popularity',
      number: 12
    }
  },
  
  // App Configuration
  APP: {
    name: import.meta.env.VITE_APP_NAME || 'Smart Recipe Tracker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: 'Your ultimate companion for discovering, planning, and cooking delicious recipes',
    author: 'Smart Recipe Team',
    repository: 'https://github.com/yourusername/smart-recipe-tracker'
  }
};

// Application Constants
export const APP_CONSTANTS = {
  // Navigation Routes
  ROUTES: {
    HOME: '/',
    SEARCH: '/search',
    DISCOVERY: '/discovery',
    NUTRITION: '/nutrition',
    MEAL_PLANNER: '/meal-planner',
    SHOPPING: '/shopping',
    HEALTH: '/health',
    PROFILE: '/profile',
    FAVORITES: '/favorites',
    RECIPE_CREATOR: '/recipe-creator'
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    USER_PROFILE: 'smart-recipe-user-profile',
    SEARCH_HISTORY: 'smart-recipe-search-history',
    FAVORITES: 'smart-recipe-favorites',
    MEAL_PLANS: 'smart-recipe-meal-plans',
    SHOPPING_LISTS: 'smart-recipe-shopping-lists',
    NUTRITION_ENTRIES: 'smart-recipe-nutrition-entries',
    APP_SETTINGS: 'smart-recipe-app-settings',
    THEME_PREFERENCE: 'smart-recipe-theme',
    ONBOARDING_COMPLETE: 'smart-recipe-onboarding-complete'
  },
  
  // API Configuration
  API: {
    RATE_LIMITS: {
      SPOONACULAR_FREE: 150, // requests per day
      SPOONACULAR_PREMIUM: 1500,
      FIREBASE_READS: 50000, // per day
      FIREBASE_WRITES: 20000
    },
    TIMEOUTS: {
      DEFAULT: 10000, // 10 seconds
      RECIPE_SEARCH: 15000, // 15 seconds
      IMAGE_UPLOAD: 30000 // 30 seconds
    },
    RETRY_CONFIG: {
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000, // 1 second
      BACKOFF_MULTIPLIER: 2
    }
  },
  
  // UI Configuration
  UI: {
    BREAKPOINTS: {
      XS: 0,
      SM: 576,
      MD: 768,
      LG: 992,
      XL: 1200,
      XXL: 1400
    },
    ANIMATION_DURATIONS: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
      LOADING: 1000
    },
    DEBOUNCE_DELAYS: {
      SEARCH: 300,
      FILTER: 500,
      SAVE: 1000
    },
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 12,
      MAX_PAGE_SIZE: 50,
      INFINITE_SCROLL_THRESHOLD: 200
    }
  },
  
  // Feature Flags
  FEATURES: {
    AI_RECOMMENDATIONS: true,
    MEAL_PLANNING: true,
    NUTRITION_TRACKING: true,
    SHOPPING_LISTS: true,
    SOCIAL_FEATURES: true,
    OFFLINE_MODE: false, // Future feature
    VOICE_COMMANDS: false, // Future feature
    BARCODE_SCANNING: false, // Future feature
    DARK_MODE: true,
    RECIPE_SHARING: true,
    MEAL_PREP_MODE: true
  },
  
  // Nutrition & Health
  NUTRITION: {
    DEFAULT_GOALS: {
      CALORIES: {
        SEDENTARY_FEMALE: 1800,
        SEDENTARY_MALE: 2200,
        ACTIVE_FEMALE: 2000,
        ACTIVE_MALE: 2600,
        VERY_ACTIVE_FEMALE: 2400,
        VERY_ACTIVE_MALE: 3000
      },
      MACROS: {
        PROTEIN_MIN: 10, // % of calories
        PROTEIN_MAX: 35,
        CARBS_MIN: 45,
        CARBS_MAX: 65,
        FAT_MIN: 20,
        FAT_MAX: 35
      }
    },
    ACTIVITY_MULTIPLIERS: {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9
    }
  },
  
  // Recipe Configuration
  RECIPES: {
    DIFFICULTY_LEVELS: {
      EASY: { level: 1, label: 'Easy', maxTime: 30 },
      MEDIUM: { level: 2, label: 'Medium', maxTime: 60 },
      HARD: { level: 3, label: 'Hard', maxTime: 120 },
      EXPERT: { level: 4, label: 'Expert', maxTime: 999 }
    },
    MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'],
    CUISINES: [
      'american', 'italian', 'mexican', 'chinese', 'indian',
      'mediterranean', 'japanese', 'thai', 'french', 'greek'
    ],
    DIETARY_RESTRICTIONS: [
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
      'nut-free', 'egg-free', 'soy-free', 'keto', 'paleo',
      'low-carb', 'low-fat', 'low-sodium'
    ]
  }
};

// Application State Management
export class AppStateManager {
  constructor() {
    this.state = {
      user: null,
      isAuthenticated: false,
      currentRoute: '/',
      searchResults: [],
      favorites: [],
      mealPlans: [],
      shoppingLists: [],
      nutritionEntries: [],
      loading: false,
      error: null,
      notifications: [],
      theme: 'dark', // Default to dark theme
      sidebarOpen: false,
      modalOpen: null
    };
    
    this.listeners = new Map();
    this.middlewares = [];
    
    // Initialize from localStorage
    this.initializeFromStorage();
  }
  
  // State management methods
  getState() {
    return { ...this.state };
  }
  
  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Run middlewares
    this.middlewares.forEach(middleware => {
      middleware(this.state, prevState);
    });
    
    // Notify listeners
    this.listeners.forEach(listener => {
      listener(this.state, prevState);
    });
    
    // Persist to localStorage
    this.persistToStorage();
  }
  
  subscribe(listener) {
    const id = Math.random().toString(36).substr(2, 9);
    this.listeners.set(id, listener);
    
    return () => {
      this.listeners.delete(id);
    };
  }
  
  addMiddleware(middleware) {
    this.middlewares.push(middleware);
  }
  
  initializeFromStorage() {
    try {
      const savedProfile = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_PROFILE);
      const savedFavorites = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.FAVORITES);
      const savedTheme = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.THEME_PREFERENCE);
      
      if (savedProfile) {
        this.state.user = JSON.parse(savedProfile);
        this.state.isAuthenticated = true;
      }
      
      if (savedFavorites) {
        this.state.favorites = JSON.parse(savedFavorites);
      }
      
      if (savedTheme) {
        this.state.theme = savedTheme;
      }
    } catch (error) {
      console.warn('Error loading state from localStorage:', error);
    }
  }
  
  persistToStorage() {
    try {
      if (this.state.user) {
        localStorage.setItem(
          APP_CONSTANTS.STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(this.state.user)
        );
      }
      
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.FAVORITES,
        JSON.stringify(this.state.favorites)
      );
      
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.THEME_PREFERENCE,
        this.state.theme
      );
    } catch (error) {
      console.warn('Error saving state to localStorage:', error);
    }
  }
}

// Error Handling Configuration
export const ERROR_HANDLERS = {
  API_ERROR: (error) => {
    console.error('API Error:', error);
    return {
      type: 'error',
      message: 'Failed to fetch data. Please check your connection and try again.',
      code: error.code || 'API_ERROR'
    };
  },
  
  FIREBASE_ERROR: (error) => {
    console.error('Firebase Error:', error);
    const errorMessages = {
      'auth/user-not-found': 'User not found. Please check your credentials.',
      'auth/wrong-password': 'Invalid password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    
    return {
      type: 'error',
      message: errorMessages[error.code] || 'Authentication error occurred.',
      code: error.code
    };
  },
  
  VALIDATION_ERROR: (error) => {
    return {
      type: 'error',
      message: 'Please check your input and try again.',
      code: 'VALIDATION_ERROR',
      fields: error.fields || []
    };
  },
  
  NETWORK_ERROR: (error) => {
    return {
      type: 'error',
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }
};

// Performance Monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.enabled = ENV.NODE_ENV === 'development';
  }
  
  startTimer(name) {
    if (!this.enabled) return;
    this.metrics[name] = { start: performance.now() };
  }
  
  endTimer(name) {
    if (!this.enabled || !this.metrics[name]) return;
    
    const duration = performance.now() - this.metrics[name].start;
    this.metrics[name].duration = duration;
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    
    return duration;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  logPageLoad() {
    if (!this.enabled) return;
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('📊 Page Load Metrics:', {
        DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        LoadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        TotalTime: navigation.loadEventEnd - navigation.fetchStart
      });
    });
  }
}

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  EVENTS: {
    PAGE_VIEW: 'page_view',
    RECIPE_SEARCH: 'recipe_search',
    RECIPE_VIEW: 'recipe_view',
    RECIPE_FAVORITE: 'recipe_favorite',
    MEAL_PLAN_CREATE: 'meal_plan_create',
    NUTRITION_LOG: 'nutrition_log',
    SHOPPING_LIST_CREATE: 'shopping_list_create',
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login'
  },
  
  USER_PROPERTIES: {
    AGE_GROUP: 'age_group',
    DIETARY_PREFERENCES: 'dietary_preferences',
    COOKING_SKILL: 'cooking_skill',
    ACTIVITY_LEVEL: 'activity_level'
  }
};

// Initialize global instances
export const appState = new AppStateManager();
export const performanceMonitor = new PerformanceMonitor();

// Environment configuration export
export { ENV };

// Validation utilities
export const VALIDATORS = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  },
  
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim().length > 0;
  },
  
  positiveNumber: (value) => {
    return !isNaN(value) && parseFloat(value) > 0;
  },
  
  range: (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }
};

// Utility functions
export const UTILS = {
  // Debounce function for search and input optimization
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for scroll and resize events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Format numbers for display
  formatNumber: (num, decimals = 0) => {
    return Number(num).toFixed(decimals);
  },
  
  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Generate unique IDs
  generateId: () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  },
  
  // Deep clone objects
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },
  
  // Check if device is mobile
  isMobile: () => {
    return window.innerWidth <= APP_CONSTANTS.UI.BREAKPOINTS.MD;
  },
  
  // Local storage with error handling
  storage: {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
      }
    },
    
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn(`Error writing to localStorage: ${key}`, error);
        return false;
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn(`Error removing from localStorage: ${key}`, error);
        return false;
      }
    }
  }
};

// Initialize performance monitoring
performanceMonitor.logPageLoad();

// Export everything for easy importing
export default {
  ENV,
  APP_CONSTANTS,
  AppStateManager,
  ERROR_HANDLERS,
  PerformanceMonitor,
  ANALYTICS_CONFIG,
  VALIDATORS,
  UTILS,
  appState,
  performanceMonitor
};