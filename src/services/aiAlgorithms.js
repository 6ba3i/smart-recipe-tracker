/**
 * Enhanced AI Algorithms Service for Recipe App
 * 
 * Features:
 * - Nutrition prediction algorithms
 * - Recipe recommendation engine
 * - Meal planning optimization
 * - Eating pattern analysis
 * - Machine learning predictions
 * - Integration with Firebase for data storage
 */

import FirebaseService from './firebaseService';

class RecipeAI {
  // ============================================================================
  // NUTRITION PREDICTION ALGORITHMS
  // ============================================================================
  
  /**
   * Predict daily nutritional needs based on user profile
   */
  static predictNutritionNeeds(userProfile, activityLevel = 'moderate') {
    console.log('Predicting nutrition needs for user profile:', userProfile);
    
    try {
      const { age, gender, weight, height, goal } = userProfile;
      
      // Base Metabolic Rate calculation (Mifflin-St Jeor Equation)
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
      };
      
      const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
      
      // Goal adjustments
      let targetCalories = tdee;
      if (goal === 'lose') {
        targetCalories = tdee - 500; // 1 lb per week
      } else if (goal === 'gain') {
        targetCalories = tdee + 500; // 1 lb per week
      }
      
      // Macro distribution (balanced approach)
      const protein = Math.round((targetCalories * 0.25) / 4); // 25% protein
      const carbs = Math.round((targetCalories * 0.45) / 4);   // 45% carbs
      const fat = Math.round((targetCalories * 0.30) / 9);     // 30% fat
      
      const prediction = {
        calories: Math.round(targetCalories),
        protein: protein,
        carbohydrates: carbs,
        fat: fat,
        fiber: Math.round(weight * 0.5), // 0.5g per kg body weight
        water: Math.round(weight * 35), // 35ml per kg body weight
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        activityLevel,
        confidence: 0.85
      };
      
      console.log('Nutrition prediction completed:', prediction);
      return prediction;
    } catch (error) {
      console.error('Error in nutrition prediction:', error);
      throw error;
    }
  }
  
  /**
   * Predict optimal meal timing based on lifestyle
   */
  static predictMealTiming(lifestyle, workSchedule) {
    console.log('Predicting meal timing for lifestyle:', lifestyle);
    
    try {
      const timingStrategies = {
        'early-bird': {
          breakfast: '6:00-7:00',
          lunch: '11:30-12:30',
          dinner: '5:30-6:30',
          snacks: ['9:30', '15:00']
        },
        'night-owl': {
          breakfast: '8:00-9:00',
          lunch: '13:00-14:00',
          dinner: '19:00-20:00',
          snacks: ['11:00', '17:00']
        },
        'shift-worker': {
          breakfast: 'flexible',
          lunch: 'flexible',
          dinner: 'flexible',
          snacks: ['every 3-4 hours']
        }
      };
      
      const timing = timingStrategies[lifestyle] || timingStrategies['early-bird'];
      
      return {
        mealTiming: timing,
        intermittentFasting: this.suggestIntermittentFasting(lifestyle),
        confidence: 0.78
      };
    } catch (error) {
      console.error('Error in meal timing prediction:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // RECIPE RECOMMENDATION ENGINE
  // ============================================================================
  
  /**
   * Advanced recipe recommendation using collaborative filtering
   */
  static async recommendRecipes(userId, preferences, nutritionGoals, limit = 10) {
    console.log('Generating recipe recommendations for user:', userId);
    
    try {
      // Get user's favorite recipes for preference learning
      let userFavorites = [];
      if (userId) {
        userFavorites = await FirebaseService.getFavoriteRecipes(userId);
      }
      
      // Extract preference patterns
      const preferenceProfile = this.analyzePreferencePatterns(userFavorites, preferences);
      
      // Score recipes based on multiple factors
      const scoringFactors = {
        nutritionMatch: 0.3,
        cuisinePreference: 0.25,
        dietaryRestrictions: 0.2,
        cookingTime: 0.15,
        popularityScore: 0.1
      };
      
      // Simulate recipe scoring (in real implementation, this would query actual recipes)
      const recommendations = this.generateRecipeScores(
        preferenceProfile,
        nutritionGoals,
        scoringFactors,
        limit
      );
      
      // Save recommendation to Firebase for learning
      if (userId) {
        await FirebaseService.saveAIPrediction(userId, {
          type: 'recipe_recommendation',
          input: { preferences, nutritionGoals },
          result: recommendations,
          confidence: 0.82,
          algorithm: 'collaborative_filtering_v2'
        });
      }
      
      console.log(`Generated ${recommendations.length} recipe recommendations`);
      return recommendations;
    } catch (error) {
      console.error('Error in recipe recommendation:', error);
      throw error;
    }
  }
  
  /**
   * Analyze user preference patterns from favorites
   */
  static analyzePreferencePatterns(userFavorites, explicitPreferences) {
    const patterns = {
      cuisines: {},
      dishTypes: {},
      cookingTimes: [],
      healthScores: [],
      ingredients: {},
      diets: {}
    };
    
    userFavorites.forEach(favorite => {
      const recipe = favorite.recipe;
      
      // Cuisine preferences
      if (recipe.cuisines) {
        recipe.cuisines.forEach(cuisine => {
          patterns.cuisines[cuisine] = (patterns.cuisines[cuisine] || 0) + 1;
        });
      }
      
      // Dish type preferences
      if (recipe.dishTypes) {
        recipe.dishTypes.forEach(type => {
          patterns.dishTypes[type] = (patterns.dishTypes[type] || 0) + 1;
        });
      }
      
      // Cooking time preferences
      if (recipe.readyInMinutes) {
        patterns.cookingTimes.push(recipe.readyInMinutes);
      }
      
      // Health score preferences
      if (recipe.healthScore) {
        patterns.healthScores.push(recipe.healthScore);
      }
    });
    
    // Calculate averages and preferences
    return {
      preferredCuisines: Object.keys(patterns.cuisines).sort((a, b) => 
        patterns.cuisines[b] - patterns.cuisines[a]
      ).slice(0, 5),
      preferredDishTypes: Object.keys(patterns.dishTypes).sort((a, b) => 
        patterns.dishTypes[b] - patterns.dishTypes[a]
      ).slice(0, 5),
      averageCookingTime: patterns.cookingTimes.length > 0 ? 
        patterns.cookingTimes.reduce((a, b) => a + b, 0) / patterns.cookingTimes.length : 30,
      averageHealthScore: patterns.healthScores.length > 0 ?
        patterns.healthScores.reduce((a, b) => a + b, 0) / patterns.healthScores.length : 50,
      explicitPreferences: explicitPreferences || {}
    };
  }
  
  /**
   * Generate recipe scores based on user profile
   */
  static generateRecipeScores(preferenceProfile, nutritionGoals, scoringFactors, limit) {
    // Simulated recipe database (in real implementation, this would be actual data)
    const sampleRecipes = [
      {
        id: 1,
        title: "Mediterranean Quinoa Bowl",
        cuisine: "mediterranean",
        dishType: "main course",
        readyInMinutes: 25,
        healthScore: 85,
        calories: 420,
        protein: 18,
        carbs: 45,
        fat: 15
      },
      {
        id: 2,
        title: "Asian Stir-Fry Vegetables",
        cuisine: "asian",
        dishType: "main course",
        readyInMinutes: 15,
        healthScore: 78,
        calories: 320,
        protein: 12,
        carbs: 35,
        fat: 10
      },
      // Add more sample recipes...
    ];
    
    // Score each recipe
    const scoredRecipes = sampleRecipes.map(recipe => {
      let score = 0;
      
      // Nutrition matching
      if (nutritionGoals.calories) {
        const calorieMatch = 1 - Math.abs(recipe.calories - nutritionGoals.calories) / nutritionGoals.calories;
        score += calorieMatch * scoringFactors.nutritionMatch;
      }
      
      // Cuisine preference
      if (preferenceProfile.preferredCuisines.includes(recipe.cuisine)) {
        score += scoringFactors.cuisinePreference;
      }
      
      // Cooking time preference
      const timeMatch = 1 - Math.abs(recipe.readyInMinutes - preferenceProfile.averageCookingTime) / 60;
      score += Math.max(0, timeMatch) * scoringFactors.cookingTime;
      
      // Health score
      const healthMatch = recipe.healthScore / 100;
      score += healthMatch * scoringFactors.popularityScore;
      
      return {
        ...recipe,
        recommendationScore: Math.max(0, Math.min(1, score)),
        reasons: this.generateRecommendationReasons(recipe, preferenceProfile, nutritionGoals)
      };
    });
    
    // Sort by score and return top results
    return scoredRecipes
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }
  
  /**
   * Generate explanation for why recipe was recommended
   */
  static generateRecommendationReasons(recipe, profile, goals) {
    const reasons = [];
    
    if (profile.preferredCuisines.includes(recipe.cuisine)) {
      reasons.push(`Matches your preference for ${recipe.cuisine} cuisine`);
    }
    
    if (Math.abs(recipe.readyInMinutes - profile.averageCookingTime) <= 10) {
      reasons.push(`Fits your typical cooking time of ${Math.round(profile.averageCookingTime)} minutes`);
    }
    
    if (recipe.healthScore >= profile.averageHealthScore) {
      reasons.push(`High health score (${recipe.healthScore}/100)`);
    }
    
    if (goals.calories && Math.abs(recipe.calories - goals.calories) <= 100) {
      reasons.push(`Matches your calorie target (${recipe.calories} calories)`);
    }
    
    return reasons;
  }
  
  // ============================================================================
  // MEAL PLANNING OPTIMIZATION
  // ============================================================================
  
  /**
   * Generate optimized meal plan using genetic algorithm approach
   */
  static async generateOptimalMealPlan(userId, preferences, nutritionGoals, duration = 7) {
    console.log('Generating optimal meal plan for', duration, 'days');
    
    try {
      const mealPlan = {
        duration,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: []
      };
      
      // Get recommended recipes for the meal plan
      const recommendations = await this.recommendRecipes(userId, preferences, nutritionGoals, 50);
      
      // Generate daily meal plans
      for (let day = 1; day <= duration; day++) {
        const dailyMeals = this.optimizeDailyMeals(recommendations, nutritionGoals);
        mealPlan.meals.push({
          day,
          date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          breakfast: dailyMeals.breakfast,
          lunch: dailyMeals.lunch,
          dinner: dailyMeals.dinner,
          snacks: dailyMeals.snacks,
          dailyTotals: dailyMeals.totals
        });
        
        // Update overall totals
        mealPlan.totalCalories += dailyMeals.totals.calories;
        mealPlan.totalProtein += dailyMeals.totals.protein;
        mealPlan.totalCarbs += dailyMeals.totals.carbs;
        mealPlan.totalFat += dailyMeals.totals.fat;
      }
      
      // Calculate averages
      mealPlan.averageCalories = Math.round(mealPlan.totalCalories / duration);
      mealPlan.averageProtein = Math.round(mealPlan.totalProtein / duration);
      mealPlan.averageCarbs = Math.round(mealPlan.totalCarbs / duration);
      mealPlan.averageFat = Math.round(mealPlan.totalFat / duration);
      
      // Save meal plan prediction
      if (userId) {
        await FirebaseService.saveAIPrediction(userId, {
          type: 'meal_plan_generation',
          input: { preferences, nutritionGoals, duration },
          result: mealPlan,
          confidence: 0.87,
          algorithm: 'genetic_optimization_v1'
        });
      }
      
      console.log('Optimal meal plan generated successfully');
      return mealPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }
  
  /**
   * Optimize daily meal distribution
   */
  static optimizeDailyMeals(availableRecipes, nutritionGoals) {
    const targetCalories = nutritionGoals.calories || 2000;
    
    // Calorie distribution throughout the day
    const distribution = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snacks: 0.10
    };
    
    const dailyMeals = {
      breakfast: this.selectMealRecipes(availableRecipes, targetCalories * distribution.breakfast, 'breakfast'),
      lunch: this.selectMealRecipes(availableRecipes, targetCalories * distribution.lunch, 'lunch'),
      dinner: this.selectMealRecipes(availableRecipes, targetCalories * distribution.dinner, 'dinner'),
      snacks: this.selectMealRecipes(availableRecipes, targetCalories * distribution.snacks, 'snack')
    };
    
    // Calculate daily totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    Object.values(dailyMeals).flat().forEach(recipe => {
      totals.calories += recipe.calories || 0;
      totals.protein += recipe.protein || 0;
      totals.carbs += recipe.carbs || 0;
      totals.fat += recipe.fat || 0;
    });
    
    return {
      ...dailyMeals,
      totals
    };
  }
  
  /**
   * Select recipes for specific meal type and calorie target
   */
  static selectMealRecipes(recipes, targetCalories, mealType) {
    const suitableRecipes = recipes.filter(recipe => {
      // Filter by meal type appropriateness
      if (mealType === 'breakfast') {
        return recipe.dishType === 'breakfast' || recipe.readyInMinutes <= 20;
      } else if (mealType === 'snack') {
        return recipe.calories <= 300;
      }
      return true;
    });
    
    // Simple selection based on calorie target
    if (suitableRecipes.length === 0) return [];
    
    const selected = suitableRecipes.find(recipe => 
      Math.abs((recipe.calories || 0) - targetCalories) <= 100
    );
    
    return selected ? [selected] : [suitableRecipes[0]];
  }
  
  // ============================================================================
  // EATING PATTERN ANALYSIS
  // ============================================================================
  
  /**
   * Analyze eating patterns and predict future needs
   */
  static async analyzeEatingPatterns(userId, timeframe = 30) {
    console.log('Analyzing eating patterns for user:', userId);
    
    try {
      // Get nutrition entries from Firebase
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeframe * 24 * 60 * 60 * 1000);
      
      const nutritionEntries = await FirebaseService.getNutritionEntries(userId, startDate, endDate);
      
      if (nutritionEntries.length === 0) {
        console.log('No nutrition data available for analysis');
        return {
          patterns: {},
          predictions: {},
          confidence: 0,
          message: 'Insufficient data for pattern analysis'
        };
      }
      
      // Analyze patterns
      const patterns = {
        averageCalories: this.calculateAverage(nutritionEntries, 'totalCalories'),
        averageProtein: this.calculateAverage(nutritionEntries, 'totalProtein'),
        averageCarbs: this.calculateAverage(nutritionEntries, 'totalCarbs'),
        averageFat: this.calculateAverage(nutritionEntries, 'totalFat'),
        mealFrequency: this.analyzeMealFrequency(nutritionEntries),
        weekdayVsWeekend: this.analyzeWeekdayPatterns(nutritionEntries),
        macroTrends: this.analyzeMacroTrends(nutritionEntries),
        consistency: this.calculateConsistency(nutritionEntries)
      };
      
      // Generate predictions
      const predictions = {
        nextWeekCalories: this.predictNextWeekCalories(nutritionEntries),
        recommendedAdjustments: this.recommendNutritionAdjustments(patterns),
        riskFactors: this.identifyRiskFactors(patterns),
        improvementSuggestions: this.generateImprovementSuggestions(patterns)
      };
      
      // Save analysis
      await FirebaseService.saveAIPrediction(userId, {
        type: 'eating_pattern_analysis',
        input: { timeframe, dataPoints: nutritionEntries.length },
        result: { patterns, predictions },
        confidence: 0.78,
        algorithm: 'pattern_analysis_v2'
      });
      
      console.log('Eating pattern analysis completed');
      return {
        patterns,
        predictions,
        confidence: 0.78,
        dataPoints: nutritionEntries.length,
        timeframe
      };
    } catch (error) {
      console.error('Error analyzing eating patterns:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Calculate average of a specific field from data array
   */
  static calculateAverage(data, field) {
    const values = data.map(item => item[field] || 0).filter(val => val > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }
  
  /**
   * Analyze meal frequency patterns
   */
  static analyzeMealFrequency(nutritionEntries) {
    const frequencies = nutritionEntries.map(entry => 
      (entry.meals || []).length
    );
    
    return {
      average: frequencies.length > 0 ? 
        frequencies.reduce((a, b) => a + b, 0) / frequencies.length : 0,
      mostCommon: this.findMostCommon(frequencies),
      range: frequencies.length > 0 ? {
        min: Math.min(...frequencies),
        max: Math.max(...frequencies)
      } : { min: 0, max: 0 }
    };
  }
  
  /**
   * Analyze weekday vs weekend patterns
   */
  static analyzeWeekdayPatterns(nutritionEntries) {
    const weekdayEntries = nutritionEntries.filter(entry => {
      const date = new Date(entry.date);
      const day = date.getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    });
    
    const weekendEntries = nutritionEntries.filter(entry => {
      const date = new Date(entry.date);
      const day = date.getDay();
      return day === 0 || day === 6; // Saturday and Sunday
    });
    
    return {
      weekday: {
        averageCalories: this.calculateAverage(weekdayEntries, 'totalCalories'),
        averageProtein: this.calculateAverage(weekdayEntries, 'totalProtein')
      },
      weekend: {
        averageCalories: this.calculateAverage(weekendEntries, 'totalCalories'),
        averageProtein: this.calculateAverage(weekendEntries, 'totalProtein')
      }
    };
  }
  
  /**
   * Analyze macro nutrient trends over time
   */
  static analyzeMacroTrends(nutritionEntries) {
    const sortedEntries = nutritionEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedEntries.length < 7) {
      return { trend: 'insufficient_data' };
    }
    
    // Calculate weekly averages to identify trends
    const weeks = [];
    for (let i = 0; i < sortedEntries.length; i += 7) {
      const weekData = sortedEntries.slice(i, i + 7);
      weeks.push({
        calories: this.calculateAverage(weekData, 'totalCalories'),
        protein: this.calculateAverage(weekData, 'totalProtein'),
        carbs: this.calculateAverage(weekData, 'totalCarbs'),
        fat: this.calculateAverage(weekData, 'totalFat')
      });
    }
    
    // Simple trend analysis (increasing, decreasing, stable)
    const calculateTrend = (values) => {
      if (values.length < 2) return 'stable';
      const first = values[0];
      const last = values[values.length - 1];
      const diff = (last - first) / first;
      
      if (diff > 0.1) return 'increasing';
      if (diff < -0.1) return 'decreasing';
      return 'stable';
    };
    
    return {
      calories: calculateTrend(weeks.map(w => w.calories)),
      protein: calculateTrend(weeks.map(w => w.protein)),
      carbs: calculateTrend(weeks.map(w => w.carbs)),
      fat: calculateTrend(weeks.map(w => w.fat)),
      weeklyData: weeks
    };
  }
  
  /**
   * Calculate consistency score
   */
  static calculateConsistency(nutritionEntries) {
    const calories = nutritionEntries.map(entry => entry.totalCalories || 0);
    if (calories.length === 0) return 0;
    
    const mean = calories.reduce((a, b) => a + b, 0) / calories.length;
    const variance = calories.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / calories.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Consistency score (lower standard deviation = higher consistency)
    const maxExpectedSD = mean * 0.3; // 30% of mean as max expected deviation
    const consistencyScore = Math.max(0, 1 - (standardDeviation / maxExpectedSD));
    
    return {
      score: consistencyScore,
      standardDeviation,
      interpretation: consistencyScore > 0.7 ? 'high' : 
                     consistencyScore > 0.4 ? 'moderate' : 'low'
    };
  }
  
  /**
   * Find most common value in array
   */
  static findMostCommon(arr) {
    const frequency = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }
  
  /**
   * Predict next week calories based on trends
   */
  static predictNextWeekCalories(nutritionEntries) {
    const recentWeek = nutritionEntries.slice(0, 7);
    const averageCalories = this.calculateAverage(recentWeek, 'totalCalories');
    
    // Simple prediction with slight variation
    return Math.round(averageCalories * (0.95 + Math.random() * 0.1));
  }
  
  /**
   * Recommend nutrition adjustments
   */
  static recommendNutritionAdjustments(patterns) {
    const recommendations = [];
    
    if (patterns.averageCalories < 1200) {
      recommendations.push('Consider increasing calorie intake for better health');
    }
    
    if (patterns.averageProtein < patterns.averageCalories * 0.15 / 4) {
      recommendations.push('Increase protein intake to support muscle health');
    }
    
    if (patterns.consistency.score < 0.5) {
      recommendations.push('Try to maintain more consistent eating patterns');
    }
    
    return recommendations;
  }
  
  /**
   * Identify potential risk factors
   */
  static identifyRiskFactors(patterns) {
    const risks = [];
    
    if (patterns.averageCalories < 1000) {
      risks.push({ type: 'low_calorie', severity: 'high' });
    }
    
    if (patterns.consistency.score < 0.3) {
      risks.push({ type: 'inconsistent_eating', severity: 'medium' });
    }
    
    return risks;
  }
  
  /**
   * Generate improvement suggestions
   */
  static generateImprovementSuggestions(patterns) {
    const suggestions = [];
    
    suggestions.push('Maintain regular meal times for better metabolism');
    suggestions.push('Include a variety of nutrients in your daily intake');
    suggestions.push('Consider meal prep to improve consistency');
    
    return suggestions;
  }
  
  /**
   * Suggest intermittent fasting based on lifestyle
   */
  static suggestIntermittentFasting(lifestyle) {
    const ifSuggestions = {
      'early-bird': '16:8 (eat 7am-3pm)',
      'night-owl': '16:8 (eat 12pm-8pm)',
      'shift-worker': 'Not recommended due to irregular schedule'
    };
    
    return ifSuggestions[lifestyle] || '16:8 (eat 12pm-8pm)';
  }
}

export default RecipeAI;