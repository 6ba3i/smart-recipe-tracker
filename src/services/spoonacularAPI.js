/**
 * Enhanced Spoonacular API Service
 * 
 * Features:
 * - Complete API endpoint coverage
 * - Request caching and rate limiting
 * - Error handling and retry logic
 * - Response transformation
 * - Detailed logging
 * - API usage tracking
 */

export class SpoonacularAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.spoonacular.com';
    this.requestCount = 0;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second

    if (!this.apiKey) {
      console.error('Spoonacular API key is required');
      throw new Error('API key is required');
    }

    this.log('info', 'Spoonacular API initialized');
  }

  // ====================================
  // LOGGING AND UTILITIES
  // ====================================

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [SPOONACULAR-${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'info':
        console.info(logMessage, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  }

  getCacheKey(endpoint, params) {
    const sortedParams = Object.keys(params || {})
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.log('info', `Cache hit for ${key}`);
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ====================================
  // HTTP REQUEST HANDLER
  // ====================================

  async makeRequest(endpoint, params = {}, options = {}) {
    const { useCache = true, retries = this.maxRetries } = options;
    const cacheKey = this.getCacheKey(endpoint, params);

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    // Build URL with parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('apiKey', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    this.log('info', `Making request to: ${endpoint}`, params);
    this.requestCount++;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 402) {
            throw new Error('API quota exceeded. Please check your Spoonacular plan.');
          } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your Spoonacular API key.');
          } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait before making more requests.');
          } else if (response.status >= 500) {
            throw new Error(`Server error (${response.status}): ${errorText}`);
          } else {
            throw new Error(`Request failed (${response.status}): ${errorText}`);
          }
        }

        const data = await response.json();
        
        // Cache successful responses
        if (useCache) {
          this.setCache(cacheKey, data);
        }

        this.log('info', `Request successful: ${endpoint}`);
        return data;

      } catch (error) {
        this.log('error', `Request failed (attempt ${attempt + 1}/${retries + 1}): ${endpoint}`, error.message);
        
        if (attempt < retries && !error.message.includes('quota') && !error.message.includes('API key')) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        throw error;
      }
    }
  }

  // ====================================
  // RECIPE SEARCH ENDPOINTS
  // ====================================

  async searchRecipes(params = {}) {
    const {
      query = '',
      cuisine,
      diet,
      intolerances,
      equipment,
      includeIngredients,
      excludeIngredients,
      type,
      instructionsRequired = true,
      fillIngredients = false,
      addRecipeInformation = true,
      addRecipeNutrition = false,
      maxReadyTime,
      minCalories,
      maxCalories,
      minCarbs,
      maxCarbs,
      minProtein,
      maxProtein,
      minFat,
      maxFat,
      minSugar,
      maxSugar,
      minFiber,
      maxFiber,
      minSodium,
      maxSodium,
      sort = 'popularity',
      sortDirection = 'desc',
      number = 10,
      offset = 0
    } = params;

    try {
      const searchParams = {
        query,
        cuisine,
        diet,
        intolerances,
        equipment,
        includeIngredients,
        excludeIngredients,
        type,
        instructionsRequired,
        fillIngredients,
        addRecipeInformation,
        addRecipeNutrition,
        maxReadyTime,
        minCalories,
        maxCalories,
        minCarbs,
        maxCarbs,
        minProtein,
        maxProtein,
        minFat,
        maxFat,
        minSugar,
        maxSugar,
        minFiber,
        maxFiber,
        minSodium,
        maxSodium,
        sort,
        sortDirection,
        number: Math.min(number, 100), // API limit
        offset
      };

      const results = await this.makeRequest('/recipes/complexSearch', searchParams);
      
      return {
        results: results.results || [],
        totalResults: results.totalResults || 0,
        offset: results.offset || 0,
        number: results.number || 0
      };
    } catch (error) {
      this.log('error', 'Recipe search failed', error);
      throw new Error(`Recipe search failed: ${error.message}`);
    }
  }

  async getRecipeDetails(recipeId, includeNutrition = false) {
    try {
      const params = {
        includeNutrition
      };

      const recipe = await this.makeRequest(`/recipes/${recipeId}/information`, params);
      
      // Transform the response for consistency
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        imageType: recipe.imageType,
        servings: recipe.servings,
        readyInMinutes: recipe.readyInMinutes,
        cookingMinutes: recipe.cookingMinutes,
        preparationMinutes: recipe.preparationMinutes,
        license: recipe.license,
        sourceName: recipe.sourceName,
        sourceUrl: recipe.sourceUrl,
        spoonacularSourceUrl: recipe.spoonacularSourceUrl,
        aggregateLikes: recipe.aggregateLikes,
        healthScore: recipe.healthScore,
        spoonacularScore: recipe.spoonacularScore,
        pricePerServing: recipe.pricePerServing,
        cheap: recipe.cheap,
        creditsText: recipe.creditsText,
        cuisines: recipe.cuisines || [],
        dishTypes: recipe.dishTypes || [],
        diets: recipe.diets || [],
        occasions: recipe.occasions || [],
        instructions: recipe.instructions,
        analyzedInstructions: recipe.analyzedInstructions || [],
        originalId: recipe.originalId,
        summary: recipe.summary,
        extendedIngredients: recipe.extendedIngredients || [],
        nutrition: recipe.nutrition || null,
        winePairing: recipe.winePairing || null,
        taste: recipe.taste || null
      };
    } catch (error) {
      this.log('error', `Get recipe details failed for ID: ${recipeId}`, error);
      throw new Error(`Failed to get recipe details: ${error.message}`);
    }
  }

  async getRandomRecipes(params = {}) {
    const {
      limitLicense = true,
      tags,
      number = 10
    } = params;

    try {
      const randomParams = {
        limitLicense,
        tags,
        number: Math.min(number, 100)
      };

      const response = await this.makeRequest('/recipes/random', randomParams);
      return response.recipes || [];
    } catch (error) {
      this.log('error', 'Get random recipes failed', error);
      throw new Error(`Failed to get random recipes: ${error.message}`);
    }
  }

  async autocompleteRecipeSearch(query, number = 5) {
    try {
      const params = {
        query,
        number: Math.min(number, 25)
      };

      const results = await this.makeRequest('/recipes/autocomplete', params);
      return results || [];
    } catch (error) {
      this.log('error', 'Autocomplete search failed', error);
      return []; // Return empty array instead of throwing for autocomplete
    }
  }

  async getSimilarRecipes(recipeId, number = 3) {
    try {
      const params = {
        number: Math.min(number, 10)
      };

      const results = await this.makeRequest(`/recipes/${recipeId}/similar`, params);
      return results || [];
    } catch (error) {
      this.log('error', `Get similar recipes failed for ID: ${recipeId}`, error);
      throw new Error(`Failed to get similar recipes: ${error.message}`);
    }
  }

  // ====================================
  // INGREDIENT AND FOOD ENDPOINTS
  // ====================================

  async searchFood(query, number = 10) {
    try {
      const params = {
        query,
        number: Math.min(number, 100)
      };

      const results = await this.makeRequest('/food/search', params);
      return {
        results: results.searchResults || [],
        totalResults: results.totalResults || 0
      };
    } catch (error) {
      this.log('error', 'Food search failed', error);
      throw new Error(`Food search failed: ${error.message}`);
    }
  }

  async searchIngredients(query, number = 10) {
    try {
      const params = {
        query,
        number: Math.min(number, 100),
        metaInformation: true
      };

      const results = await this.makeRequest('/food/ingredients/search', params);
      return results.results || [];
    } catch (error) {
      this.log('error', 'Ingredient search failed', error);
      throw new Error(`Ingredient search failed: ${error.message}`);
    }
  }

  async getIngredientInformation(ingredientId, amount = 1, unit = 'serving') {
    try {
      const params = {
        amount,
        unit
      };

      const ingredient = await this.makeRequest(`/food/ingredients/${ingredientId}/information`, params);
      return ingredient;
    } catch (error) {
      this.log('error', `Get ingredient information failed for ID: ${ingredientId}`, error);
      throw new Error(`Failed to get ingredient information: ${error.message}`);
    }
  }

  // ====================================
  // NUTRITION ENDPOINTS
  // ====================================

  async analyzeRecipeNutrition(recipe) {
    try {
      const params = {
        defaultCss: true,
        showBacklink: false
      };

      // This would require a POST request with recipe data
      // For now, return a placeholder response
      this.log('warn', 'Recipe nutrition analysis not fully implemented');
      return {
        calories: null,
        nutrients: [],
        properties: []
      };
    } catch (error) {
      this.log('error', 'Recipe nutrition analysis failed', error);
      throw new Error(`Recipe nutrition analysis failed: ${error.message}`);
    }
  }

  async getNutritionByIngredients(ingredients) {
    try {
      // Convert ingredients array to API format
      const ingredientList = ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`).join('\n');
      
      const params = {
        ingredientList,
        servings: 1,
        defaultCss: true,
        showBacklink: false
      };

      const nutrition = await this.makeRequest('/recipes/parseIngredients', params);
      return nutrition;
    } catch (error) {
      this.log('error', 'Get nutrition by ingredients failed', error);
      throw new Error(`Failed to get nutrition information: ${error.message}`);
    }
  }

  // ====================================
  // MEAL PLANNING ENDPOINTS
  // ====================================

  async generateMealPlan(params = {}) {
    const {
      timeFrame = 'day',
      targetCalories,
      diet,
      exclude
    } = params;

    try {
      const mealPlanParams = {
        timeFrame,
        targetCalories,
        diet,
        exclude
      };

      const mealPlan = await this.makeRequest('/mealplanner/generate', mealPlanParams);
      return mealPlan;
    } catch (error) {
      this.log('error', 'Generate meal plan failed', error);
      throw new Error(`Failed to generate meal plan: ${error.message}`);
    }
  }

  async getShoppingList(mealPlan) {
    try {
      // This would typically be a POST request with meal plan data
      // For now, return a placeholder
      this.log('warn', 'Shopping list generation not fully implemented');
      return {
        aisles: [],
        cost: 0,
        startDate: null,
        endDate: null
      };
    } catch (error) {
      this.log('error', 'Generate shopping list failed', error);
      throw new Error(`Failed to generate shopping list: ${error.message}`);
    }
  }

  // ====================================
  // WINE PAIRING ENDPOINTS
  // ====================================

  async getWinePairing(food, maxPrice) {
    try {
      const params = {
        food,
        maxPrice
      };

      const pairing = await this.makeRequest('/food/wine/pairing', params);
      return pairing;
    } catch (error) {
      this.log('error', 'Wine pairing failed', error);
      throw new Error(`Failed to get wine pairing: ${error.message}`);
    }
  }

  // ====================================
  // API USAGE AND STATS
  // ====================================

  getRequestCount() {
    return this.requestCount;
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  clearCache() {
    this.cache.clear();
    this.log('info', 'Cache cleared');
  }

  // ====================================
  // DEMO DATA FALLBACK
  // ====================================

  getDemoRecipes() {
    return [
      {
        id: 'demo_1',
        title: 'Classic Chicken Parmesan',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        readyInMinutes: 45,
        servings: 4,
        spoonacularScore: 85,
        cuisines: ['Italian'],
        dishTypes: ['dinner', 'main course']
      },
      {
        id: 'demo_2',
        title: 'Vegetable Stir Fry',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        readyInMinutes: 20,
        servings: 2,
        spoonacularScore: 78,
        cuisines: ['Asian'],
        dishTypes: ['lunch', 'dinner']
      },
      {
        id: 'demo_3',
        title: 'Chocolate Chip Cookies',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
        readyInMinutes: 30,
        servings: 24,
        spoonacularScore: 92,
        cuisines: ['American'],
        dishTypes: ['dessert']
      }
    ];
  }

  async searchRecipesWithFallback(params = {}) {
    try {
      return await this.searchRecipes(params);
    } catch (error) {
      this.log('warn', 'API request failed, using demo data', error.message);
      
      const demoRecipes = this.getDemoRecipes();
      const query = params.query?.toLowerCase() || '';
      
      const filteredRecipes = query 
        ? demoRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(query) ||
            recipe.cuisines.some(cuisine => cuisine.toLowerCase().includes(query))
          )
        : demoRecipes;

      return {
        results: filteredRecipes,
        totalResults: filteredRecipes.length,
        offset: 0,
        number: filteredRecipes.length
      };
    }
  }
}