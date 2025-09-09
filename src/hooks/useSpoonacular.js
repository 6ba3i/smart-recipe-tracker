import { useState, useCallback, useRef } from 'react';
import { SpoonacularAPI } from '../services/spoonacularAPI';

const useSpoonacular = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiRef = useRef(new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY));

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const searchRecipes = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const results = await apiRef.current.searchRecipes(params);
      return results;
    } catch (err) {
      console.error('Search recipes error:', err);
      setError(err.message || 'Failed to search recipes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecipeDetails = useCallback(async (recipeId) => {
    try {
      setLoading(true);
      setError(null);
      const recipe = await apiRef.current.getRecipeDetails(recipeId);
      return recipe;
    } catch (err) {
      console.error('Get recipe details error:', err);
      setError(err.message || 'Failed to get recipe details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRandomRecipes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const recipes = await apiRef.current.getRandomRecipes(params);
      return recipes;
    } catch (err) {
      console.error('Get random recipes error:', err);
      setError(err.message || 'Failed to get random recipes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFood = useCallback(async (query, number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const results = await apiRef.current.searchFood(query, number);
      return results;
    } catch (err) {
      console.error('Search food error:', err);
      setError(err.message || 'Failed to search food');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const autocompleteRecipeSearch = useCallback(async (query, number = 5) => {
    try {
      const suggestions = await apiRef.current.autocompleteRecipeSearch(query, number);
      return suggestions;
    } catch (err) {
      console.error('Autocomplete error:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    searchRecipes,
    getRecipeDetails,
    getRandomRecipes,
    searchFood,
    autocompleteRecipeSearch,
    api: apiRef.current
  };
};

export default useSpoonacular;