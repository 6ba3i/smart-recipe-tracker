import { useState, useCallback } from 'react';
import FirebaseService from '../services/firebaseService';

const useFirebase = (userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // User Profile Operations
  const saveUserProfile = useCallback(async (profileData) => {
    if (!userId) throw new Error('User ID required');
    
    try {
      setLoading(true);
      setError(null);
      await FirebaseService.saveUserProfile(userId, profileData);
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err.message || 'Failed to save profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getUserProfile = useCallback(async () => {
    if (!userId) throw new Error('User ID required');
    
    try {
      setLoading(true);
      setError(null);
      const profile = await FirebaseService.getUserProfile(userId);
      return profile;
    } catch (err) {
      console.error('Get profile error:', err);
      setError(err.message || 'Failed to get profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Favorites Operations
  const saveFavorite = useCallback(async (recipe) => {
    if (!userId) throw new Error('User ID required');
    
    try {
      setLoading(true);
      setError(null);
      await FirebaseService.saveFavoriteRecipe(userId, recipe);
    } catch (err) {
      console.error('Save favorite error:', err);
      setError(err.message || 'Failed to save favorite');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const removeFavorite = useCallback(async (recipeId) => {
    if (!userId) throw new Error('User ID required');
    
    try {
      setLoading(true);
      setError(null);
      await FirebaseService.removeFavoriteRecipe(userId, recipeId);
    } catch (err) {
      console.error('Remove favorite error:', err);
      setError(err.message || 'Failed to remove favorite');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getFavorites = useCallback(async () => {
    if (!userId) return [];
    
    try {
      setLoading(true);
      setError(null);
      const favorites = await FirebaseService.getFavoriteRecipes(userId);
      return favorites;
    } catch (err) {
      console.error('Get favorites error:', err);
      setError(err.message || 'Failed to get favorites');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Meal Plan Operations
  const saveMealPlan = useCallback(async (mealPlan) => {
    if (!userId) throw new Error('User ID required');
    
    try {
      setLoading(true);
      setError(null);
      await FirebaseService.saveMealPlan(userId, mealPlan);
    } catch (err) {
      console.error('Save meal plan error:', err);
      setError(err.message || 'Failed to save meal plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getMealPlan = useCallback(async (startDate, endDate) => {
    if (!userId) return {};
    
    try {
      setLoading(true);
      setError(null);
      const mealPlan = await FirebaseService.getMealPlan(userId, startDate, endDate);
      return mealPlan;
    } catch (err) {
      console.error('Get meal plan error:', err);
      setError(err.message || 'Failed to get meal plan');
      return {};
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Nutrition Operations
  const addNutritionEntry = useCallback(async (entry) => {
    if (!userId) throw new Error('User ID required');
    
    try {
      setLoading(true);
      setError(null);
      await FirebaseService.addNutritionEntry(userId, entry);
    } catch (err) {
      console.error('Add nutrition entry error:', err);
      setError(err.message || 'Failed to add nutrition entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getNutritionLog = useCallback(async (date) => {
    if (!userId) return [];
    
    try {
      setLoading(true);
      setError(null);
      const log = await FirebaseService.getNutritionLog(userId, date);
      return log;
    } catch (err) {
      console.error('Get nutrition log error:', err);
      setError(err.message || 'Failed to get nutrition log');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    loading,
    error,
    clearError,
    // Profile
    saveUserProfile,
    getUserProfile,
    // Favorites
    saveFavorite,
    removeFavorite,
    getFavorites,
    // Meal Plans
    saveMealPlan,
    getMealPlan,
    // Nutrition
    addNutritionEntry,
    getNutritionLog
  };
};

export default useFirebase;
