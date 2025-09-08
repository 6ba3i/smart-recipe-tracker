// Enhanced Spoonacular API Integration - No Fallbacks
class SpoonacularAPI {
    constructor() {
        this.config = {
            apiKey: 'a197d4a8778b40389a0d3d0a6a82f32d',
            baseUrl: 'https://api.spoonacular.com'
        };
        this.cache = new Map();
        this.rateLimit = {
            requests: 0,
            lastReset: Date.now(),
            maxRequests: 150,
            interval: 24 * 60 * 60 * 1000
        };
        this.userProfile = this.loadUserProfile();
    }

    loadUserProfile() {
        return {
            allergies: [],
            intolerances: [],
            diet: '',
            cuisinePreferences: [],
            dislikedIngredients: [],
            preferredNutrition: {
                minProtein: 20,
                maxCalories: 600,
                maxCarbs: 50,
                maxFat: 30
            },
            cookingSkill: 'intermediate',
            timeConstraints: 45,
            budgetRange: 'moderate'
        };
    }

    updateUserProfile(profile) {
        this.userProfile = { ...this.userProfile, ...profile };
        // Save to Firebase
        if (window.firebaseConfig?.helper) {
            window.firebaseConfig.helper.saveUserData('spoonacularProfile', this.userProfile);
        }
    }

    async makeRequest(endpoint, params = {}) {
        try {
            this.checkRateLimit();

            const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
            if (this.cache.has(cacheKey)) {
                console.log('Cache hit for:', endpoint);
                return this.cache.get(cacheKey);
            }

            const url = new URL(`${this.config.baseUrl}${endpoint}`);
            url.searchParams.append('apiKey', this.config.apiKey);
            
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, value);
                }
            });

            console.log('Making Spoonacular API request:', url.pathname);

            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache for 1 hour
            this.cache.set(cacheKey, data);
            setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

            return data;
        } catch (error) {
            console.error('Spoonacular API error:', error);
            throw error;
        }
    }

    checkRateLimit() {
        const now = Date.now();
        if (now - this.rateLimit.lastReset > this.rateLimit.interval) {
            this.rateLimit.requests = 0;
            this.rateLimit.lastReset = now;
        }

        if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
            throw new Error('Daily API limit reached. Please try again tomorrow.');
        }

        this.rateLimit.requests++;
    }

    // Advanced Recipe Search with User Preferences
    async searchRecipes(query = '', options = {}) {
        const params = {
            query: query,
            number: options.number || 12,
            offset: options.offset || 0,
            addRecipeInformation: true,
            addRecipeNutrition: true,
            fillIngredients: true,
            sort: options.sort || 'popularity'
        };

        // Apply user preferences
        if (this.userProfile.diet) {
            params.diet = this.userProfile.diet;
        }

        if (this.userProfile.intolerances.length > 0) {
            params.intolerances = this.userProfile.intolerances.join(',');
        }

        if (this.userProfile.cuisinePreferences.length > 0 && !options.cuisine) {
            params.cuisine = this.userProfile.cuisinePreferences.join(',');
        }

        if (options.cuisine) params.cuisine = options.cuisine;
        if (options.maxReadyTime) params.maxReadyTime = options.maxReadyTime;
        if (options.minCalories) params.minCalories = options.minCalories;
        if (options.maxCalories) params.maxCalories = options.maxCalories;
        if (options.minProtein) params.minProtein = options.minProtein;
        if (options.maxCarbs) params.maxCarbs = options.maxCarbs;

        // Exclude disliked ingredients
        if (this.userProfile.dislikedIngredients.length > 0) {
            params.excludeIngredients = this.userProfile.dislikedIngredients.join(',');
        }

        const data = await this.makeRequest('/recipes/complexSearch', params);
        
        // Enhance results with recommendation scores
        if (data.results) {
            data.results = data.results.map(recipe => ({
                ...recipe,
                recommendationScore: this.calculateRecommendationScore(recipe),
                matchReasons: this.getMatchReasons(recipe)
            })).sort((a, b) => b.recommendationScore - a.recommendationScore);
        }

        return data;
    }

    calculateRecommendationScore(recipe) {
        let score = 0;

        // Base popularity score
        score += (recipe.aggregateLikes || 0) / 10;

        // Nutrition alignment
        if (recipe.nutrition?.nutrients) {
            const calories = this.getNutrientValue(recipe.nutrition.nutrients, 'Calories');
            const protein = this.getNutrientValue(recipe.nutrition.nutrients, 'Protein');
            const carbs = this.getNutrientValue(recipe.nutrition.nutrients, 'Carbohydrates');

            // Calorie range preference
            const targetCalories = this.userProfile.preferredNutrition.maxCalories;
            if (calories <= targetCalories && calories >= targetCalories * 0.6) {
                score += 30;
            }

            // Protein preference
            if (protein >= this.userProfile.preferredNutrition.minProtein) {
                score += 25;
            }

            // Carb preference
            if (this.userProfile.diet === 'ketogenic' && carbs <= 20) {
                score += 20;
            } else if (carbs <= this.userProfile.preferredNutrition.maxCarbs) {
                score += 15;
            }
        }

        // Time constraint alignment
        if (recipe.readyInMinutes <= this.userProfile.timeConstraints) {
            score += 20;
        }

        // Cuisine preference
        if (this.userProfile.cuisinePreferences.includes(recipe.cuisines?.[0])) {
            score += 15;
        }

        // Health score consideration
        if (recipe.healthScore > 50) {
            score += 10;
        }

        // Dietary compliance
        if (this.userProfile.vegetarian && recipe.vegetarian) score += 15;
        if (this.userProfile.vegan && recipe.vegan) score += 15;
        if (this.userProfile.glutenFree && recipe.glutenFree) score += 15;
        if (this.userProfile.dairyFree && recipe.dairyFree) score += 15;

        return Math.round(score);
    }

    getMatchReasons(recipe) {
        const reasons = [];

        if (recipe.readyInMinutes <= this.userProfile.timeConstraints) {
            reasons.push('Quick to prepare');
        }

        if (recipe.healthScore > 70) {
            reasons.push('High health score');
        }

        if (recipe.nutrition?.nutrients) {
            const protein = this.getNutrientValue(recipe.nutrition.nutrients, 'Protein');
            if (protein >= this.userProfile.preferredNutrition.minProtein) {
                reasons.push('High protein');
            }
        }

        if (this.userProfile.cuisinePreferences.includes(recipe.cuisines?.[0])) {
            reasons.push('Preferred cuisine');
        }

        if (recipe.vegetarian && this.userProfile.vegetarian) {
            reasons.push('Vegetarian-friendly');
        }

        if (recipe.vegan && this.userProfile.vegan) {
            reasons.push('Vegan-friendly');
        }

        if (recipe.glutenFree && this.userProfile.glutenFree) {
            reasons.push('Gluten-free');
        }

        return reasons;
    }

    getNutrientValue(nutrients, name) {
        const nutrient = nutrients.find(n => n.name === name);
        return nutrient ? nutrient.amount : 0;
    }

    // Get personalized recipe recommendations
    async getPersonalizedRecommendations(count = 12) {
        const params = {
            number: count,
            addRecipeInformation: true,
            addRecipeNutrition: true,
            fillIngredients: true
        };

        // Apply all user preferences for personalized recommendations
        if (this.userProfile.diet) {
            params.diet = this.userProfile.diet;
        }

        if (this.userProfile.intolerances.length > 0) {
            params.intolerances = this.userProfile.intolerances.join(',');
        }

        if (this.userProfile.cuisinePreferences.length > 0) {
            params.cuisine = this.userProfile.cuisinePreferences.join(',');
        }

        if (this.userProfile.dislikedIngredients.length > 0) {
            params.excludeIngredients = this.userProfile.dislikedIngredients.join(',');
        }

        // Nutrition constraints
        params.maxCalories = this.userProfile.preferredNutrition.maxCalories;
        params.minProtein = this.userProfile.preferredNutrition.minProtein;
        params.maxReadyTime = this.userProfile.timeConstraints;

        // Use random endpoint for variety
        const data = await this.makeRequest('/recipes/random', params);
        
        if (data.recipes) {
            return data.recipes.map(recipe => ({
                ...recipe,
                recommendationScore: this.calculateRecommendationScore(recipe),
                matchReasons: this.getMatchReasons(recipe)
            })).sort((a, b) => b.recommendationScore - a.recommendationScore);
        }

        return [];
    }

    // Find recipes by ingredients with preferences
    async findByIngredients(ingredients, number = 10) {
        const params = {
            ingredients: Array.isArray(ingredients) ? ingredients.join(',') : ingredients,
            number,
            ranking: 1,
            ignorePantry: false,
            addRecipeInformation: true
        };

        const data = await this.makeRequest('/recipes/findByIngredients', params);
        
        // Get full information for each recipe
        const detailedRecipes = await Promise.all(
            data.slice(0, 6).map(recipe => this.getRecipeInformation(recipe.id))
        );

        return detailedRecipes.filter(recipe => recipe !== null);
    }

    // Get detailed recipe information
    async getRecipeInformation(recipeId) {
        try {
            const params = {
                includeNutrition: true,
                includeTaste: true
            };

            const recipe = await this.makeRequest(`/recipes/${recipeId}/information`, params);
            
            return {
                ...recipe,
                recommendationScore: this.calculateRecommendationScore(recipe),
                matchReasons: this.getMatchReasons(recipe)
            };
        } catch (error) {
            console.error(`Error fetching recipe ${recipeId}:`, error);
            return null;
        }
    }

    // Generate meal plan with user preferences
    async generateMealPlan(timeFrame = 'week', targetCalories = null) {
        const params = {
            timeFrame,
            targetCalories: targetCalories || this.userProfile.preferredNutrition.maxCalories * 3, // 3 meals
        };

        if (this.userProfile.diet) {
            params.diet = this.userProfile.diet;
        }

        if (this.userProfile.intolerances.length > 0) {
            params.exclude = this.userProfile.intolerances.join(',');
        }

        return await this.makeRequest('/mealplanner/generate', params);
    }

    // Search foods for nutrition tracking
    async searchFood(query, number = 10) {
        const params = {
            query,
            number,
            addChildrenData: true
        };

        return await this.makeRequest('/food/ingredients/search', params);
    }

    // Get ingredient nutrition information
    async getIngredientNutrition(ingredientId, amount = 1, unit = 'serving') {
        const params = { amount, unit };
        return await this.makeRequest(`/food/ingredients/${ingredientId}/information`, params);
    }

    // Analyze recipe nutrition
    async analyzeRecipe(title, servings, ingredients, instructions = '') {
        const body = {
            title,
            servings: parseInt(servings),
            ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
            instructions: instructions || 'Combine ingredients and cook as desired.'
        };

        try {
            const response = await fetch(`${this.config.baseUrl}/recipes/analyze?apiKey=${this.config.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Recipe analysis error:', error);
            throw error;
        }
    }

    // Get similar recipes
    async getSimilarRecipes(recipeId, number = 6) {
        const params = { number };
        return await this.makeRequest(`/recipes/${recipeId}/similar`, params);
    }

    // Get recipe taste profile
    async getRecipeTaste(recipeId) {
        return await this.makeRequest(`/recipes/${recipeId}/tasteWidget`);
    }

    // Search recipes by nutrition
    async searchByNutrition(nutritionParams) {
        const params = {
            addRecipeInformation: true,
            addRecipeNutrition: true,
            number: 12,
            ...nutritionParams
        };

        return await this.makeRequest('/recipes/findByNutrients', params);
    }

    // Get recipe price breakdown
    async getRecipePriceBreakdown(recipeId) {
        return await this.makeRequest(`/recipes/${recipeId}/priceBreakdownWidget`);
    }

    // Convert recipe measurements
    async convertAmount(ingredientName, sourceAmount, sourceUnit, targetUnit) {
        const params = {
            ingredientName,
            sourceAmount,
            sourceUnit,
            targetUnit
        };

        return await this.makeRequest('/recipes/convert', params);
    }

    // Get autocomplete suggestions
    async getAutocomplete(query, number = 5) {
        const params = { query, number };
        return await this.makeRequest('/recipes/autocomplete', params);
    }

    // Get ingredient substitutes
    async getIngredientSubstitutes(ingredientName) {
        const params = { ingredientName };
        return await this.makeRequest('/food/ingredients/substitutes', params);
    }

    // Get wine pairing for recipe
    async getWinePairing(food) {
        const params = { food };
        return await this.makeRequest('/food/wine/pairing', params);
    }

    // Get jokes about food (for entertainment)
    async getFoodJoke() {
        return await this.makeRequest('/food/jokes/random');
    }

    // Get recipe equipment
    async getRecipeEquipment(recipeId) {
        return await this.makeRequest(`/recipes/${recipeId}/equipmentWidget`);
    }

    // Classify cuisine
    async classifyCuisine(title, ingredientList) {
        const params = {
            title,
            ingredientList
        };

        return await this.makeRequest('/recipes/cuisine', params);
    }

    // Get menu item information
    async getMenuItemInfo(menuItemId) {
        return await this.makeRequest(`/food/menuItems/${menuItemId}`);
    }

    // Search menu items
    async searchMenuItems(query, number = 10) {
        const params = { query, number };
        return await this.makeRequest('/food/menuItems/search', params);
    }

    // Get shopping list from meal plan
    async generateShoppingList(mealPlan) {
        const username = 'demo_user';
        const hash = 'demo_hash';
        
        try {
            const response = await fetch(`${this.config.baseUrl}/mealplanner/${username}/shopping-list/${hash}?apiKey=${this.config.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mealPlan)
            });

            return await response.json();
        } catch (error) {
            console.error('Shopping list generation error:', error);
            throw error;
        }
    }

    // Rate limit status
    getRateLimitStatus() {
        return {
            requests: this.rateLimit.requests,
            maxRequests: this.rateLimit.maxRequests,
            remaining: this.rateLimit.maxRequests - this.rateLimit.requests,
            resetTime: new Date(this.rateLimit.lastReset + this.rateLimit.interval)
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('Spoonacular cache cleared');
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Initialize enhanced Spoonacular API
const spoonacularAPI = new SpoonacularAPI();

// Export for global use
window.spoonacularAPI = spoonacularAPI;

console.log('Enhanced Spoonacular API loaded successfully');