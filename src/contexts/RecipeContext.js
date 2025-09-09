/**
 * Recipe Context for Global State Management
 * 
 * Manages recipe-related state across the application
 * Integrates with Spoonacular API and Firebase
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import FirebaseService from '../services/firebaseService';

const RecipeContext = createContext();

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};

// Action types
const RECIPE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_MEAL_PLANS: 'SET_MEAL_PLANS',
  ADD_MEAL_PLAN: 'ADD_MEAL_PLAN',
  UPDATE_MEAL_PLAN: 'UPDATE_MEAL_PLAN',
  DELETE_MEAL_PLAN: 'DELETE_MEAL_PLAN',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_FILTERS: 'SET_SEARCH_FILTERS',
  SET_NUTRITION_ENTRIES: 'SET_NUTRITION_ENTRIES',
  ADD_NUTRITION_ENTRY: 'ADD_NUTRITION_ENTRY',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES'
};

// Initial state
const initialState = {
  // Search state
  searchResults: [],
  searchQuery: '',
  searchFilters: {},
  searchLoading: false,
  
  // Favorites
  favorites: [],
  favoritesLoading: false,
  
  // Meal plans
  mealPlans: [],
  mealPlansLoading: false,
  
  // Nutrition tracking
  nutritionEntries: [],
  nutritionLoading: false,
  
  // User preferences
  userPreferences: null,
  preferencesLoading: false,
  
  // General state
  error: null,
  loading: false
};

// Reducer function
const recipeReducer = (state, action) => {
  switch (action.type) {
    case RECIPE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
        [`${action.payload.type}Loading`]: action.payload.loading
      };
      
    case RECIPE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case RECIPE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case RECIPE_ACTIONS.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
        searchLoading: false
      };
      
    case RECIPE_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
      
    case RECIPE_ACTIONS.SET_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...action.payload }
      };
      
    case RECIPE_ACTIONS.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
        favoritesLoading: false
      };
      
    case RECIPE_ACTIONS.ADD_FAVORITE:
      return {
        ...state,
        favorites: [action.payload, ...state.favorites]
      };
      
    case RECIPE_ACTIONS.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.id !== action.payload)
      };
      
    case RECIPE_ACTIONS.SET_MEAL_PLANS:
      return {
        ...state,
        mealPlans: action.payload,
        mealPlansLoading: false
      };
      
    case RECIPE_ACTIONS.ADD_MEAL_PLAN:
      return {
        ...state,
        mealPlans: [action.payload, ...state.mealPlans]
      };
      
    case RECIPE_ACTIONS.UPDATE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan =>
          plan.id === action.payload.id ? { ...plan, ...action.payload.updates } : plan
        )
      };
      
    case RECIPE_ACTIONS.DELETE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.filter(plan => plan.id !== action.payload)
      };
      
    case RECIPE_ACTIONS.SET_NUTRITION_ENTRIES:
      return {
        ...state,
        nutritionEntries: action.payload,
        nutritionLoading: false
      };
      
    case RECIPE_ACTIONS.ADD_NUTRITION_ENTRY:
      return {
        ...state,
        nutritionEntries: [action.payload, ...state.nutritionEntries]
      };
      
    case RECIPE_ACTIONS.SET_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: action.payload,
        preferencesLoading: false
      };
      
    case RECIPE_ACTIONS.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      };
      
    default:
      return state;
  }
};

export const RecipeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, initialState);
  const { user } = useAuth();

  // Load user data when authenticated
  useEffect(() => {
    if (user?.uid) {
      loadUserData();
    } else {
      // Clear user-specific data when logged out
      dispatch({ type: RECIPE_ACTIONS.SET_FAVORITES, payload: [] });
      dispatch({ type: RECIPE_ACTIONS.SET_MEAL_PLANS, payload: [] });
      dispatch({ type: RECIPE_ACTIONS.SET_NUTRITION_ENTRIES, payload: [] });
      dispatch({ type: RECIPE_ACTIONS.SET_USER_PREFERENCES, payload: null });
    }
  }, [user]);

  // Load all user data
  const loadUserData = async () => {
    if (!user?.uid) return;

    try {
      console.log('Loading user data for:', user.uid);
      
      // Load data in parallel
      const [favorites, mealPlans, preferences] = await Promise.all([
        loadFavorites(),
        loadMealPlans(),
        loadUserPreferences()
      ]);

      console.log('User data loaded successfully');
    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch({ 
        type: RECIPE_ACTIONS.SET_ERROR, 
        payload: 'Failed to load user data' 
      });
    }
  };

  // Favorites management
  const loadFavorites = async () => {
    if (!user?.uid) return;

    try {
      dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: { type: 'favorites', loading: true } });
      const favorites = await FirebaseService.getFavoriteRecipes(user.uid);
      dispatch({ type: RECIPE_ACTIONS.SET_FAVORITES, payload: favorites });
      return favorites;
    } catch (error) {
      console.error('Error loading favorites:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to load favorites' });
      return [];
    }
  };

  const addToFavorites = async (recipe) => {
    if (!user?.uid) {
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Please sign in to save favorites' });
      return;
    }

    try {
      console.log('Adding recipe to favorites:', recipe.id);
      const favoriteId = await FirebaseService.saveFavoriteRecipe(user.uid, recipe);
      
      const newFavorite = {
        id: favoriteId,
        userId: user.uid,
        recipeId: recipe.id,
        recipe,
        createdAt: new Date()
      };
      
      dispatch({ type: RECIPE_ACTIONS.ADD_FAVORITE, payload: newFavorite });
      console.log('Recipe added to favorites successfully');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to add to favorites' });
    }
  };

  const removeFromFavorites = async (favoriteId, recipeId) => {
    if (!user?.uid) return;

    try {
      console.log('Removing recipe from favorites:', favoriteId);
      await FirebaseService.removeFavoriteRecipe(favoriteId);
      dispatch({ type: RECIPE_ACTIONS.REMOVE_FAVORITE, payload: favoriteId });
      console.log('Recipe removed from favorites successfully');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to remove from favorites' });
    }
  };

  const isRecipeFavorite = (recipeId) => {
    return state.favorites.some(fav => fav.recipeId === recipeId);
  };

  const getFavoriteId = (recipeId) => {
    const favorite = state.favorites.find(fav => fav.recipeId === recipeId);
    return favorite?.id;
  };

  // Meal plans management
  const loadMealPlans = async () => {
    if (!user?.uid) return;

    try {
      dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: { type: 'mealPlans', loading: true } });
      const mealPlans = await FirebaseService.getMealPlans(user.uid);
      dispatch({ type: RECIPE_ACTIONS.SET_MEAL_PLANS, payload: mealPlans });
      return mealPlans;
    } catch (error) {
      console.error('Error loading meal plans:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to load meal plans' });
      return [];
    }
  };

  const saveMealPlan = async (mealPlan) => {
    if (!user?.uid) {
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Please sign in to save meal plans' });
      return;
    }

    try {
      console.log('Saving meal plan:', mealPlan.name);
      const mealPlanId = await FirebaseService.saveMealPlan(user.uid, mealPlan);
      
      const newMealPlan = {
        id: mealPlanId,
        userId: user.uid,
        ...mealPlan,
        createdAt: new Date()
      };
      
      dispatch({ type: RECIPE_ACTIONS.ADD_MEAL_PLAN, payload: newMealPlan });
      console.log('Meal plan saved successfully');
      return mealPlanId;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to save meal plan' });
    }
  };

  const updateMealPlan = async (mealPlanId, updates) => {
    if (!user?.uid) return;

    try {
      console.log('Updating meal plan:', mealPlanId);
      await FirebaseService.updateMealPlan(mealPlanId, updates);
      dispatch({ 
        type: RECIPE_ACTIONS.UPDATE_MEAL_PLAN, 
        payload: { id: mealPlanId, updates } 
      });
      console.log('Meal plan updated successfully');
    } catch (error) {
      console.error('Error updating meal plan:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to update meal plan' });
    }
  };

  const deleteMealPlan = async (mealPlanId) => {
    if (!user?.uid) return;

    try {
      console.log('Deleting meal plan:', mealPlanId);
      await FirebaseService.deleteMealPlan(mealPlanId);
      dispatch({ type: RECIPE_ACTIONS.DELETE_MEAL_PLAN, payload: mealPlanId });
      console.log('Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to delete meal plan' });
    }
  };

  // Nutrition tracking
  const loadNutritionEntries = async (startDate, endDate) => {
    if (!user?.uid) return;

    try {
      dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: { type: 'nutrition', loading: true } });
      const entries = await FirebaseService.getNutritionEntries(user.uid, startDate, endDate);
      dispatch({ type: RECIPE_ACTIONS.SET_NUTRITION_ENTRIES, payload: entries });
      return entries;
    } catch (error) {
      console.error('Error loading nutrition entries:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to load nutrition data' });
      return [];
    }
  };

  const saveNutritionEntry = async (nutritionData) => {
    if (!user?.uid) {
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Please sign in to track nutrition' });
      return;
    }

    try {
      console.log('Saving nutrition entry for date:', nutritionData.date);
      const entryId = await FirebaseService.saveNutritionEntry(user.uid, nutritionData);
      
      const newEntry = {
        id: entryId,
        userId: user.uid,
        ...nutritionData,
        createdAt: new Date()
      };
      
      dispatch({ type: RECIPE_ACTIONS.ADD_NUTRITION_ENTRY, payload: newEntry });
      console.log('Nutrition entry saved successfully');
      return entryId;
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to save nutrition data' });
    }
  };

  // User preferences
  const loadUserPreferences = async () => {
    if (!user?.uid) return;

    try {
      dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: { type: 'preferences', loading: true } });
      const preferences = await FirebaseService.getUserPreferences(user.uid);
      dispatch({ type: RECIPE_ACTIONS.SET_USER_PREFERENCES, payload: preferences });
      return preferences;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to load preferences' });
      return null;
    }
  };

  const updateUserPreferences = async (preferences) => {
    if (!user?.uid) return;

    try {
      console.log('Updating user preferences');
      await FirebaseService.saveUserPreferences(user.uid, preferences);
      dispatch({ type: RECIPE_ACTIONS.UPDATE_USER_PREFERENCES, payload: preferences });
      console.log('User preferences updated successfully');
    } catch (error) {
      console.error('Error updating user preferences:', error);
      dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: 'Failed to update preferences' });
    }
  };

  // Search management
  const setSearchResults = (results) => {
    dispatch({ type: RECIPE_ACTIONS.SET_SEARCH_RESULTS, payload: results });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: RECIPE_ACTIONS.SET_SEARCH_QUERY, payload: query });
  };

  const setSearchFilters = (filters) => {
    dispatch({ type: RECIPE_ACTIONS.SET_SEARCH_FILTERS, payload: filters });
  };

  const clearSearchFilters = () => {
    dispatch({ type: RECIPE_ACTIONS.SET_SEARCH_FILTERS, payload: {} });
  };

  // Error management
  const clearError = () => {
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });
  };

  const setError = (error) => {
    dispatch({ type: RECIPE_ACTIONS.SET_ERROR, payload: error });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Favorites methods
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    isRecipeFavorite,
    getFavoriteId,
    
    // Meal plans methods
    loadMealPlans,
    saveMealPlan,
    updateMealPlan,
    deleteMealPlan,
    
    // Nutrition methods
    loadNutritionEntries,
    saveNutritionEntry,
    
    // Preferences methods
    loadUserPreferences,
    updateUserPreferences,
    
    // Search methods
    setSearchResults,
    setSearchQuery,
    setSearchFilters,
    clearSearchFilters,
    
    // Utility methods
    loadUserData,
    clearError,
    setError
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};