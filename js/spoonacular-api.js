// Spoonacular API Integration for Smart Recipe Tracker

class SpoonacularAPI {
    constructor() {
        // TODO: Replace with your actual Spoonacular API key
        // Get it from: https://spoonacular.com/food-api/console#Dashboard
        this.apiKey = 'YOUR_SPOONACULAR_API_KEY';
        this.baseURL = 'https://api.spoonacular.com';
        
        // Cache for API responses to reduce calls
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        
        this.validateApiKey();
    }

    validateApiKey() {
        if (this.apiKey === 'YOUR_SPOONACULAR_API_KEY') {
            console.warn('⚠️  Spoonacular API key not configured. Please set your API key in js/spoonacular-api.js');
            console.warn('📝 Get your API key from: https://spoonacular.com/food-api/console#Dashboard');
        }
    }

    // Generic API request method with error handling and caching
    async makeRequest(endpoint, params = {}) {
        // Check cache first
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
        const cachedResult = this.cache.get(cacheKey);
        
        if (cachedResult && Date.now() - cachedResult.timestamp < this.cacheTimeout) {
            return cachedResult.data;
        }

        const url = new URL(`${this.baseURL}${endpoint}`);
        url.searchParams.append('apiKey', this.apiKey);
        
        // Add parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Spoonacular API key.');
                } else if (response.status === 402) {
                    throw new Error('API quota exceeded. Please upgrade your Spoonacular plan.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }
            }

            const data = await response.json();
            
            // Cache successful results
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Spoonacular API Error:', error);
            throw error;
        }
    }

    // Search for recipes
    async searchRecipes(query, options = {}) {
        const params = {
            query,
            number: options.number || 12,
            offset: options.offset || 0,
            type: options.type, // main course, side dish, dessert, appetizer, salad, bread, breakfast, soup, beverage, sauce, marinade, fingerfood, snack, drink
            cuisine: options.cuisine, // african, american, british, cajun, caribbean, chinese, eastern european, european, french, german, greek, indian, irish, italian, japanese, jewish, korean, latin american, mediterranean, mexican, middle eastern, nordic, southern, spanish, thai, vietnamese
            diet: options.diet, // gluten free, ketogenic, vegetarian, lacto-vegetarian, ovo-vegetarian, vegan, pescetarian, paleo, primal, whole30
            intolerances: options.intolerances, // dairy, egg, gluten, grain, peanut, seafood, sesame, shellfish, soy, sulfite, tree nut, wheat
            equipment: options.equipment,
            includeIngredients: options.includeIngredients,
            excludeIngredients: options.excludeIngredients,
            maxReadyTime: options.maxReadyTime,
            minCalories: options.minCalories,
            maxCalories: options.maxCalories,
            minProtein: options.minProtein,
            maxProtein: options.maxProtein,
            minCarbs: options.minCarbs,
            maxCarbs: options.maxCarbs,
            minFat: options.minFat,
            maxFat: options.maxFat,
            sort: options.sort || 'popularity', // meta-score, popularity, healthiness, price, time, random
            sortDirection: options.sortDirection || 'desc'
        };

        try {
            const data = await this.makeRequest('/recipes/complexSearch', params);
            return {
                recipes: data.results || [],
                totalResults: data.totalResults || 0,
                offset: data.offset || 0,
                number: data.number || 0
            };
        } catch (error) {
            console.error('Error searching recipes:', error);
            return {
                recipes: [],
                totalResults: 0,
                offset: 0,
                number: 0,
                error: error.message
            };
        }
    }

    // Get detailed recipe information
    async getRecipeDetails(recipeId, includeNutrition = true) {
        const params = {
            includeNutrition: includeNutrition.toString()
        };

        try {
            const data = await this.makeRequest(`/recipes/${recipeId}/information`, params);
            return this.formatRecipeDetails(data);
        } catch (error) {
            console.error('Error getting recipe details:', error);
            throw error;
        }
    }

    // Get multiple recipe details at once
    async getBulkRecipeDetails(recipeIds, includeNutrition = true) {
        const params = {
            ids: recipeIds.join(','),
            includeNutrition: includeNutrition.toString()
        };

        try {
            const data = await this.makeRequest('/recipes/informationBulk', params);
            return data.map(recipe => this.formatRecipeDetails(recipe));
        } catch (error) {
            console.error('Error getting bulk recipe details:', error);
            return [];
        }
    }

    // Get random recipes
    async getRandomRecipes(options = {}) {
        const params = {
            number: options.number || 10,
            tags: options.tags, // vegetarian, dessert, etc.
            includeNutrition: true
        };

        try {
            const data = await this.makeRequest('/recipes/random', params);
            return {
                recipes: data.recipes ? data.recipes.map(recipe => this.formatRecipeDetails(recipe)) : []
            };
        } catch (error) {
            console.error('Error getting random recipes:', error);
            return { recipes: [] };
        }
    }

    // Get similar recipes
    async getSimilarRecipes(recipeId, number = 3) {
        try {
            const data = await this.makeRequest(`/recipes/${recipeId}/similar`, { number });
            return data || [];
        } catch (error) {
            console.error('Error getting similar recipes:', error);
            return [];
        }
    }

    // Search for ingredients
    async searchIngredients(query, number = 10) {
        const params = {
            query,
            number,
            metaInformation: true
        };

        try {
            const data = await this.makeRequest('/food/ingredients/search', params);
            return data.results || [];
        } catch (error) {
            console.error('Error searching ingredients:', error);
            return [];
        }
    }

    // Get ingredient information
    async getIngredientInfo(ingredientId, amount = 1, unit = 'serving') {
        const params = {
            amount,
            unit
        };

        try {
            const data = await this.makeRequest(`/food/ingredients/${ingredientId}/information`, params);
            return data;
        } catch (error) {
            console.error('Error getting ingredient info:', error);
            return null;
        }
    }

    // Analyze a recipe for nutrition
    async analyzeRecipe(recipeData) {
        const params = {
            includeNutrition: true,
            includeTaste: false
        };

        try {
            const response = await fetch(`${this.baseURL}/recipes/analyze?apiKey=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipeData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing recipe:', error);
            throw error;
        }
    }

    // Parse ingredients from text
    async parseIngredients(ingredientList, servings = 1) {
        const params = {
            servings,
            includeNutrition: true
        };

        try {
            const response = await fetch(`${this.baseURL}/recipes/parseIngredients?apiKey=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ingredientList: ingredientList.join('\n'),
                    servings: servings.toString(),
                    includeNutrition: 'true'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error parsing ingredients:', error);
            return [];
        }
    }

    // Get meal plan for a day/week
    async generateMealPlan(timeFrame = 'day', targetCalories = 2000, diet = null) {
        const params = {
            timeFrame,
            targetCalories,
            diet
        };

        try {
            const data = await this.makeRequest('/mealplanner/generate', params);
            return data;
        } catch (error) {
            console.error('Error generating meal plan:', error);
            return null;
        }
    }

    // Get shopping list for recipes
    async getShoppingList(recipeIds) {
        const params = {
            hash: recipeIds.join(',')
        };

        try {
            const data = await this.makeRequest('/recipes/shoppingList', params);
            return data;
        } catch (error) {
            console.error('Error getting shopping list:', error);
            return { aisles: [] };
        }
    }

    // Search for food products
    async searchFood(query, number = 10) {
        const params = {
            query,
            number,
            addChildren: true
        };

        try {
            const data = await this.makeRequest('/food/search', params);
            return data.searchResults || [];
        } catch (error) {
            console.error('Error searching food:', error);
            return [];
        }
    }

    // Get autocomplete suggestions
    async getAutocomplete(query, number = 10) {
        const params = {
            query,
            number
        };

        try {
            const data = await this.makeRequest('/recipes/autocomplete', params);
            return data || [];
        } catch (error) {
            console.error('Error getting autocomplete:', error);
            return [];
        }
    }

    // Format recipe details to consistent structure
    formatRecipeDetails(recipe) {
        const nutrition = recipe.nutrition;
        const nutrients = nutrition ? nutrition.nutrients || [] : [];
        
        // Extract key nutrients
        const calories = this.findNutrient(nutrients, 'Calories') || 0;
        const protein = this.findNutrient(nutrients, 'Protein') || 0;
        const carbs = this.findNutrient(nutrients, 'Carbohydrates') || 0;
        const fat = this.findNutrient(nutrients, 'Fat') || 0;
        const fiber = this.findNutrient(nutrients, 'Fiber') || 0;
        const sugar = this.findNutrient(nutrients, 'Sugar') || 0;
        const sodium = this.findNutrient(nutrients, 'Sodium') || 0;

        return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            summary: recipe.summary,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            sourceUrl: recipe.sourceUrl,
            spoonacularSourceUrl: recipe.spoonacularSourceUrl,
            
            // Nutrition
            nutrition: {
                calories: Math.round(calories),
                protein: Math.round(protein),
                carbs: Math.round(carbs),
                fat: Math.round(fat),
                fiber: Math.round(fiber),
                sugar: Math.round(sugar),
                sodium: Math.round(sodium)
            },

            // Recipe details
            ingredients: recipe.extendedIngredients || [],
            instructions: recipe.analyzedInstructions || [],
            dishTypes: recipe.dishTypes || [],
            cuisines: recipe.cuisines || [],
            diets: recipe.diets || [],
            occasions: recipe.occasions || [],
            
            // Dietary info
            vegetarian: recipe.vegetarian || false,
            vegan: recipe.vegan || false,
            glutenFree: recipe.glutenFree || false,
            dairyFree: recipe.dairyFree || false,
            veryHealthy: recipe.veryHealthy || false,
            cheap: recipe.cheap || false,
            veryPopular: recipe.veryPopular || false,
            sustainable: recipe.sustainable || false,
            
            // Scores
            healthScore: recipe.healthScore || 0,
            spoonacularScore: recipe.spoonacularScore || 0,
            pricePerServing: recipe.pricePerServing || 0,
            
            // Wine pairing
            winePairing: recipe.winePairing || null
        };
    }

    // Helper to find specific nutrient
    findNutrient(nutrients, name) {
        const nutrient = nutrients.find(n => n.name === name);
        return nutrient ? nutrient.amount : 0;
    }

    // Get API usage info
    async getApiUsage() {
        try {
            const data = await this.makeRequest('/users/connect');
            return {
                pointsUsed: data.pointsUsed || 0,
                pointsLimit: data.pointsLimit || 150, // Free tier limit
                remainingPoints: (data.pointsLimit || 150) - (data.pointsUsed || 0)
            };
        } catch (error) {
            console.error('Error getting API usage:', error);
            return {
                pointsUsed: 0,
                pointsLimit: 150,
                remainingPoints: 150
            };
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Initialize Spoonacular API when configuration is ready
function initializeSpoonacularAPI() {
    const initAPI = () => {
        if (window.configManager) {
            window.spoonacularAPI = new SpoonacularAPI();
            console.log('🥄 Spoonacular API integration loaded');
        } else {
            setTimeout(initAPI, 50);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAPI);
    } else {
        initAPI();
    }
}

// Initialize when script loads
initializeSpoonacularAPI();

/* 
SETUP INSTRUCTIONS:

Choose one of these setup methods:

## Method 1: Configuration File (Recommended for beginners)
1. Copy `config.example.js` to `config.js`
2. Get your Spoonacular API key from: https://spoonacular.com/food-api/console#Dashboard
3. Replace the placeholder in config.js with your actual API key
4. Add `config.js` to your .gitignore file

## Method 2: Environment Variables (Recommended for build tools)
1. Copy `.env.example` to `.env`
2. Set VITE_SPOONACULAR_API_KEY=your-actual-api-key
3. Use a build tool like Vite, Webpack, or Parcel
4. Add `.env` to your .gitignore file

## Spoonacular API Setup:
1. Visit https://spoonacular.com/food-api/console#Dashboard
2. Create a free account (150 requests/day)
3. Copy your API key from the dashboard
4. Use the key in either config.js or .env file

## API Limits (Free Tier):
- 150 requests per day
- 1 request per second
- Consider upgrading for production use

## Example usage:

```javascript
// Wait for API to be ready
await window.spoonacularAPI.waitForInitialization();

// Search for recipes
const results = await window.spoonacularAPI.searchRecipes('pasta', {
    number: 10,
    diet: 'vegetarian',
    maxReadyTime: 30
});

// Get recipe details  
const recipe = await window.spoonacularAPI.getRecipeDetails(716429);

// Generate meal plan
const mealPlan = await window.spoonacularAPI.generateMealPlan('day', 2000);
```

## Error handling:
- All methods include proper error handling
- Demo mode provides mock data when API key is not configured
- API quota exceeded errors are handled gracefully
- Caching reduces API calls automatically

## Security:
- Never commit API keys to version control
- Use environment variables for production
- Monitor API usage regularly
- Rotate keys periodically

Remember to keep your API key secure!
*/