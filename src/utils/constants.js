export const API_ENDPOINTS = {
  SPOONACULAR_BASE: 'https://api.spoonacular.com',
  SPOONACULAR_SEARCH: '/recipes/complexSearch',
  SPOONACULAR_DETAILS: '/recipes/{id}/information',
  SPOONACULAR_RANDOM: '/recipes/random',
  SPOONACULAR_AUTOCOMPLETE: '/recipes/autocomplete',
  SPOONACULAR_NUTRITION: '/recipes/parseIngredients'
};

export const RECIPE_CATEGORIES = {
  MEAL_TYPES: [
    'breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert', 'drink'
  ],
  CUISINES: [
    'african', 'american', 'british', 'cajun', 'caribbean', 'chinese', 
    'eastern european', 'european', 'french', 'german', 'greek', 'indian', 
    'irish', 'italian', 'japanese', 'jewish', 'korean', 'latin american', 
    'mediterranean', 'mexican', 'middle eastern', 'nordic', 'southern', 
    'spanish', 'thai', 'vietnamese'
  ],
  DIET_TYPES: [
    'gluten free', 'ketogenic', 'vegetarian', 'lacto-vegetarian', 
    'ovo-vegetarian', 'vegan', 'pescetarian', 'paleo', 'primal', 'whole30'
  ],
  INTOLERANCES: [
    'dairy', 'egg', 'gluten', 'grain', 'peanut', 'seafood', 'sesame', 
    'shellfish', 'soy', 'sulfite', 'tree nut', 'wheat'
  ]
};

export const NUTRITION_TARGETS = {
  DAILY_VALUES: {
    calories: 2000,
    protein: 50,     // grams
    fat: 65,         // grams
    carbohydrates: 300, // grams
    fiber: 25,       // grams
    sugar: 50,       // grams
    sodium: 2300,    // milligrams
    cholesterol: 300, // milligrams
    saturatedFat: 20, // grams
    vitaminC: 90,    // milligrams
    vitaminA: 900,   // micrograms
    calcium: 1000,   // milligrams
    iron: 18         // milligrams
  },
  MACRO_RATIOS: {
    protein: { min: 0.15, max: 0.35 },
    fat: { min: 0.20, max: 0.35 },
    carbohydrates: { min: 0.45, max: 0.65 }
  }
};

export const COOKING_TIMES = {
  QUICK: { min: 0, max: 15, label: 'Quick (0-15 min)' },
  MODERATE: { min: 16, max: 30, label: 'Moderate (15-30 min)' },
  STANDARD: { min: 31, max: 60, label: 'Standard (30-60 min)' },
  LENGTHY: { min: 61, max: 120, label: 'Lengthy (1-2 hours)' },
  ELABORATE: { min: 121, max: 999, label: 'Elaborate (2+ hours)' }
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: { level: 1, label: 'Beginner', description: 'Simple recipes with basic techniques' },
  INTERMEDIATE: { level: 2, label: 'Intermediate', description: 'Moderate complexity with some advanced techniques' },
  ADVANCED: { level: 3, label: 'Advanced', description: 'Complex recipes requiring experience' },
  EXPERT: { level: 4, label: 'Expert', description: 'Professional-level techniques and precision' }
};

export const APP_ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  MEAL_PLANNER: '/meal-planner',
  NUTRITION: '/nutrition',
  FAVORITES: '/favorites',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  LOGIN: '/login',
  SIGNUP: '/signup'
};

export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'theme-preference',
  SEARCH_HISTORY: 'search-history',
  USER_PREFERENCES: 'user-preferences',
  RECENT_RECIPES: 'recent-recipes',
  MEAL_PLAN_CACHE: 'meal-plan-cache'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  API_ERROR: 'Unable to fetch data from the server. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please sign in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  QUOTA_EXCEEDED: 'API quota exceeded. Please try again later.',
  INVALID_API_KEY: 'Invalid API key. Please check your configuration.'
};

export const SUCCESS_MESSAGES = {
  RECIPE_SAVED: 'Recipe saved to favorites!',
  MEAL_PLAN_SAVED: 'Meal plan saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  NUTRITION_LOGGED: 'Nutrition entry added!',
  DATA_EXPORTED: 'Data exported successfully!'
};

export const CHART_COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
  NUTRITION_PALETTE: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ]
};

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  LOADING: 1000
};

export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
};
