/**
 * AI Integration Hook
 * 
 * Provides AI-powered recipe recommendations, nutrition analysis,
 * and meal planning capabilities through a simple React hook interface.
 */

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RecipeAI from '../services/aiAlgorithms';
import aiModels from '../data/ai-models.json';

const useAI = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState({});
  
  // Cache for AI results to avoid repeated calculations
  const cacheRef = useRef(new Map());
  const lastRequestRef = useRef(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCacheKey = useCallback((operation, params) => {
    return `${operation}_${JSON.stringify(params)}_${user?.uid || 'anonymous'}`;
  }, [user?.uid]);

  const getFromCache = useCallback((key, maxAge = 5 * 60 * 1000) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }, []);

  const setCache = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Cleanup old cache entries (keep only last 50)
    if (cacheRef.current.size > 50) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cacheRef.current = new Map(entries.slice(0, 50));
    }
  }, []);

  // Get personalized recipe recommendations
  const getRecommendations = useCallback(async (preferences = {}, options = {}) => {
    if (!user?.uid) {
      setError('User must be logged in to get personalized recommendations');
      return [];
    }

    const {
      count = 10,
      nutritionTargets = {},
      useCache = true,
      refreshUserProfile = false
    } = options;

    const cacheKey = getCacheKey('recommendations', { preferences, count, nutritionTargets });
    
    if (useCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        setRecommendations(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Optionally refresh user preferences before getting recommendations
      if (refreshUserProfile) {
        await RecipeAI.analyzeUserPreferences(user.uid);
      }

      const recs = await RecipeAI.recommendRecipes(
        user.uid, 
        preferences, 
        nutritionTargets, 
        count
      );

      setRecommendations(recs);
      
      if (useCache) {
        setCache(cacheKey, recs);
      }

      return recs;
    } catch (err) {
      console.error('Error getting AI recommendations:', err);
      setError('Failed to get personalized recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getCacheKey, getFromCache, setCache]);

  // Analyze nutrition data and get insights
  const analyzeNutrition = useCallback(async (nutritionData, goals = {}) => {
    const cacheKey = getCacheKey('nutrition_analysis', { nutritionData, goals });
    
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      setLoading(true);
      setError(null);

      const analysis = RecipeAI.analyzeNutritionalBalance(nutritionData);
      
      // Enhanced analysis with AI insights
      const enhancedAnalysis = {
        ...analysis,
        aiInsights: generateNutritionInsights(analysis, goals),
        recommendations: generateNutritionRecommendations(analysis, goals),
        trends: calculateNutritionTrends(nutritionData),
        score: calculateNutritionScore(analysis, goals)
      };

      setCache(cacheKey, enhancedAnalysis);
      return enhancedAnalysis;
    } catch (err) {
      console.error('Error analyzing nutrition:', err);
      setError('Failed to analyze nutrition data');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCacheKey, getFromCache, setCache]);

  // Generate optimal meal plan
  const generateMealPlan = useCallback(async (constraints = {}, options = {}) => {
    if (!user?.uid) {
      setError('User must be logged in to generate meal plans');
      return {};
    }

    const {
      days = 7,
      useCache = true,
      includeShopping = false
    } = options;

    const cacheKey = getCacheKey('meal_plan', { constraints, days });
    
    if (useCache) {
      const cached = getFromCache(cacheKey, 30 * 60 * 1000); // 30 min cache
      if (cached) {
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const mealPlan = await RecipeAI.generateOptimalMealPlan(
        user.uid, 
        days, 
        constraints
      );

      const enhancedPlan = {
        mealPlan,
        nutritionSummary: calculateMealPlanNutrition(mealPlan),
        variety: calculateMealPlanVariety(mealPlan),
        costEstimate: estimateMealPlanCost(mealPlan),
        ...(includeShopping && { shoppingList: generateShoppingList(mealPlan) })
      };

      if (useCache) {
        setCache(cacheKey, enhancedPlan);
      }

      return enhancedPlan;
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('Failed to generate meal plan');
      return {};
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getCacheKey, getFromCache, setCache]);

  // Get user behavior insights
  const getUserInsights = useCallback(async (options = {}) => {
    if (!user?.uid) {
      setError('User must be logged in to get insights');
      return [];
    }

    const { useCache = true, timeframe = 30 } = options;
    const cacheKey = getCacheKey('user_insights', { timeframe });
    
    if (useCache) {
      const cached = getFromCache(cacheKey, 60 * 60 * 1000); // 1 hour cache
      if (cached) {
        setInsights(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const userInsights = RecipeAI.generateInsights(user.uid);
      const behaviorPredictions = RecipeAI.predictUserBehavior(user.uid, timeframe);
      
      const combinedInsights = [
        ...userInsights,
        ...generateBehaviorInsights(behaviorPredictions),
        ...generateProgressInsights(user.uid)
      ];

      setInsights(combinedInsights);
      
      if (useCache) {
        setCache(cacheKey, combinedInsights);
      }

      return combinedInsights;
    } catch (err) {
      console.error('Error getting user insights:', err);
      setError('Failed to generate insights');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getCacheKey, getFromCache, setCache]);

  // Predict user behavior and preferences
  const getPredictions = useCallback(async (options = {}) => {
    if (!user?.uid) {
      setError('User must be logged in to get predictions');
      return {};
    }

    const { timeframe = 30, useCache = true } = options;
    const cacheKey = getCacheKey('predictions', { timeframe });
    
    if (useCache) {
      const cached = getFromCache(cacheKey, 2 * 60 * 60 * 1000); // 2 hour cache
      if (cached) {
        setPredictions(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const predictions = RecipeAI.predictUserBehavior(user.uid, timeframe);
      
      const enhancedPredictions = {
        ...predictions,
        confidence: calculatePredictionConfidence(predictions),
        recommendations: generatePredictionBasedRecommendations(predictions),
        nextActions: suggestNextActions(predictions)
      };

      setPredictions(enhancedPredictions);
      
      if (useCache) {
        setCache(cacheKey, enhancedPredictions);
      }

      return enhancedPredictions;
    } catch (err) {
      console.error('Error getting predictions:', err);
      setError('Failed to generate predictions');
      return {};
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getCacheKey, getFromCache, setCache]);

  // Get recipe similarity and alternatives
  const getSimilarRecipes = useCallback(async (recipeId, options = {}) => {
    const { count = 5, useCache = true } = options;
    const cacheKey = getCacheKey('similar_recipes', { recipeId, count });
    
    if (useCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // This would integrate with the Spoonacular API or use our own similarity algorithm
      const similarRecipes = await calculateRecipeSimilarity(recipeId, count);
      
      if (useCache) {
        setCache(cacheKey, similarRecipes);
      }

      return similarRecipes;
    } catch (err) {
      console.error('Error getting similar recipes:', err);
      setError('Failed to find similar recipes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCacheKey, getFromCache, setCache]);

  // Analyze and score a recipe
  const analyzeRecipe = useCallback(async (recipe, userContext = {}) => {
    const cacheKey = getCacheKey('recipe_analysis', { recipeId: recipe.id, userContext });
    
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const analysis = {
        healthScore: calculateHealthScore(recipe),
        difficultyScore: calculateDifficultyScore(recipe),
        personalizedScore: user?.uid ? 
          await calculatePersonalizedScore(recipe, user.uid) : null,
        nutritionAnalysis: analyzeRecipeNutrition(recipe),
        tags: generateRecipeTags(recipe),
        warnings: generateRecipeWarnings(recipe, userContext)
      };

      setCache(cacheKey, analysis);
      return analysis;
    } catch (err) {
      console.error('Error analyzing recipe:', err);
      return null;
    }
  }, [user?.uid, getCacheKey, getFromCache, setCache]);

  // Clear all caches
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Get AI model information
  const getModelInfo = useCallback(() => {
    return {
      models: aiModels,
      version: aiModels.model_versions?.current_version || '1.0.0',
      lastUpdated: aiModels.model_versions?.version_history?.slice(-1)[0]?.release_date,
      capabilities: [
        'Recipe Recommendations',
        'Nutrition Analysis',
        'Meal Planning',
        'Behavior Prediction',
        'Recipe Similarity',
        'User Insights'
      ]
    };
  }, []);

  return {
    // State
    loading,
    error,
    recommendations,
    insights,
    predictions,
    
    // Actions
    getRecommendations,
    analyzeNutrition,
    generateMealPlan,
    getUserInsights,
    getPredictions,
    getSimilarRecipes,
    analyzeRecipe,
    clearError,
    clearCache,
    getModelInfo,
    
    // Utils
    isReady: !loading && !error,
    hasCache: cacheRef.current.size > 0,
    cacheSize: cacheRef.current.size
  };
};

// Helper functions for AI analysis
const generateNutritionInsights = (analysis, goals) => {
  const insights = [];
  
  if (analysis.totals.protein < (goals.protein * 0.8)) {
    insights.push({
      type: 'protein_low',
      message: 'Consider adding more protein-rich foods to meet your goals',
      priority: 'medium'
    });
  }
  
  if (analysis.totals.fiber < 25) {
    insights.push({
      type: 'fiber_low',
      message: 'Increase fiber intake with more fruits and vegetables',
      priority: 'high'
    });
  }
  
  return insights;
};

const generateNutritionRecommendations = (analysis, goals) => {
  const recommendations = [];
  
  // Based on the nutrition analysis, generate actionable recommendations
  if (analysis.balance.carbs > 65) {
    recommendations.push('Consider reducing refined carbohydrates');
  }
  
  if (analysis.balance.protein < 15) {
    recommendations.push('Add more lean protein sources to your meals');
  }
  
  return recommendations;
};

const calculateNutritionTrends = (nutritionData) => {
  // Analyze trends in nutrition data over time
  if (!nutritionData || nutritionData.length < 7) {
    return { trend: 'insufficient_data' };
  }
  
  const recent = nutritionData.slice(-7);
  const older = nutritionData.slice(-14, -7);
  
  const recentAvg = recent.reduce((sum, day) => sum + (day.calories || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, day) => sum + (day.calories || 0), 0) / older.length;
  
  return {
    trend: recentAvg > olderAvg ? 'increasing' : 'decreasing',
    change: Math.abs(recentAvg - olderAvg),
    direction: recentAvg > olderAvg ? 'up' : 'down'
  };
};

const calculateNutritionScore = (analysis, goals) => {
  let score = 50; // Base score
  
  // Adjust based on goal achievement
  Object.keys(goals).forEach(nutrient => {
    const actual = analysis.totals[nutrient] || 0;
    const target = goals[nutrient];
    const ratio = actual / target;
    
    if (ratio >= 0.9 && ratio <= 1.1) {
      score += 10; // Perfect range
    } else if (ratio >= 0.8 && ratio <= 1.2) {
      score += 5; // Good range
    }
  });
  
  return Math.min(100, Math.max(0, score));
};

const calculateMealPlanNutrition = (mealPlan) => {
  // Calculate total nutrition across all meals in the plan
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  Object.values(mealPlan).forEach(dayMeals => {
    Object.values(dayMeals).forEach(mealTypeRecipes => {
      mealTypeRecipes.forEach(recipe => {
        totals.calories += recipe.calories || 0;
        totals.protein += recipe.protein || 0;
        totals.carbs += recipe.carbs || 0;
        totals.fat += recipe.fat || 0;
      });
    });
  });
  
  return totals;
};

const calculateMealPlanVariety = (mealPlan) => {
  const cuisines = new Set();
  const ingredients = new Set();
  
  Object.values(mealPlan).forEach(dayMeals => {
    Object.values(dayMeals).forEach(mealTypeRecipes => {
      mealTypeRecipes.forEach(recipe => {
        if (recipe.cuisines) {
          recipe.cuisines.forEach(cuisine => cuisines.add(cuisine));
        }
        if (recipe.ingredients) {
          recipe.ingredients.forEach(ing => ingredients.add(ing.name));
        }
      });
    });
  });
  
  return {
    cuisineVariety: cuisines.size,
    ingredientVariety: ingredients.size,
    score: Math.min(100, (cuisines.size * 10) + (ingredients.size * 2))
  };
};

const estimateMealPlanCost = (mealPlan) => {
  // Rough cost estimation based on recipe complexity and ingredients
  let totalCost = 0;
  let recipeCount = 0;
  
  Object.values(mealPlan).forEach(dayMeals => {
    Object.values(dayMeals).forEach(mealTypeRecipes => {
      mealTypeRecipes.forEach(recipe => {
        // Rough estimation: $2-8 per recipe based on complexity
        const baseCost = 3;
        const complexityMultiplier = (recipe.readyInMinutes || 30) / 30;
        totalCost += baseCost * complexityMultiplier;
        recipeCount++;
      });
    });
  });
  
  return {
    total: totalCost,
    perRecipe: recipeCount > 0 ? totalCost / recipeCount : 0,
    perDay: totalCost / Object.keys(mealPlan).length
  };
};

const generateShoppingList = (mealPlan) => {
  const ingredients = new Map();
  
  Object.values(mealPlan).forEach(dayMeals => {
    Object.values(dayMeals).forEach(mealTypeRecipes => {
      mealTypeRecipes.forEach(recipe => {
        if (recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            if (ingredients.has(key)) {
              ingredients.get(key).quantity += ing.amount || 1;
            } else {
              ingredients.set(key, {
                name: ing.name,
                quantity: ing.amount || 1,
                unit: ing.unit || 'item'
              });
            }
          });
        }
      });
    });
  });
  
  return Array.from(ingredients.values());
};

const generateBehaviorInsights = (predictions) => {
  const insights = [];
  
  if (predictions.likelyToTryNewCuisine > 0.8) {
    insights.push({
      type: 'adventure',
      message: 'You seem adventurous! Try exploring international cuisines',
      priority: 'low'
    });
  }
  
  if (predictions.healthConsciousness > 0.7) {
    insights.push({
      type: 'health',
      message: 'Your health-conscious choices are paying off!',
      priority: 'medium'
    });
  }
  
  return insights;
};

const generateProgressInsights = (userId) => {
  // This would analyze user's progress over time
  return [
    {
      type: 'progress',
      message: 'You\'ve been consistently tracking nutrition for 2 weeks!',
      priority: 'high'
    }
  ];
};

const calculatePredictionConfidence = (predictions) => {
  // Calculate overall confidence in predictions based on data quality
  const scores = Object.values(predictions).filter(v => typeof v === 'number');
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

const generatePredictionBasedRecommendations = (predictions) => {
  const recommendations = [];
  
  if (predictions.preferredCookingTime < 30) {
    recommendations.push('Focus on quick and easy recipes under 30 minutes');
  }
  
  if (predictions.adventurousness > 0.7) {
    recommendations.push('Try fusion cuisines and experimental recipes');
  }
  
  return recommendations;
};

const suggestNextActions = (predictions) => {
  const actions = [];
  
  if (predictions.consistencyScore < 0.6) {
    actions.push({
      action: 'improve_consistency',
      description: 'Try setting daily nutrition goals',
      priority: 'high'
    });
  }
  
  return actions;
};

const calculateRecipeSimilarity = async (recipeId, count) => {
  // This would implement recipe similarity algorithm
  // For now, return placeholder data
  return [];
};

const calculateHealthScore = (recipe) => {
  // Calculate health score based on nutrition and ingredients
  let score = 50;
  
  if (recipe.healthScore) {
    return recipe.healthScore;
  }
  
  // Add logic based on nutrition data
  return score;
};

const calculateDifficultyScore = (recipe) => {
  // Calculate difficulty based on cooking time, ingredient count, techniques
  const time = recipe.readyInMinutes || 30;
  const ingredientCount = recipe.extendedIngredients?.length || 5;
  
  if (time <= 20 && ingredientCount <= 5) return 1; // Easy
  if (time <= 45 && ingredientCount <= 10) return 2; // Medium
  if (time <= 90 && ingredientCount <= 15) return 3; // Hard
  return 4; // Expert
};

const calculatePersonalizedScore = async (recipe, userId) => {
  // This would calculate how well this recipe matches user preferences
  return Math.random() * 100; // Placeholder
};

const analyzeRecipeNutrition = (recipe) => {
  if (!recipe.nutrition) return null;
  
  return {
    calories: recipe.nutrition.calories || 0,
    macros: {
      protein: recipe.nutrition.protein || 0,
      carbs: recipe.nutrition.carbs || 0,
      fat: recipe.nutrition.fat || 0
    },
    micronutrients: recipe.nutrition.nutrients || []
  };
};

const generateRecipeTags = (recipe) => {
  const tags = [];
  
  if (recipe.readyInMinutes <= 20) tags.push('quick');
  if (recipe.healthScore > 80) tags.push('healthy');
  if (recipe.cheap) tags.push('budget-friendly');
  
  return tags;
};

const generateRecipeWarnings = (recipe, userContext) => {
  const warnings = [];
  
  if (userContext.allergies) {
    userContext.allergies.forEach(allergy => {
      if (recipe.title?.toLowerCase().includes(allergy.toLowerCase())) {
        warnings.push(`Contains ${allergy}`);
      }
    });
  }
  
  return warnings;
};

export default useAI;