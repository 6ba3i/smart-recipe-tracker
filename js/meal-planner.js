/**
 * AI-Powered Meal Planner with Spoonacular API Integration
 * Uses optimization algorithms to create balanced weekly meal plans
 */

class MealPlanner {
    constructor() {
        this.currentPlan = null;
        this.planningConstraints = {};
        this.optimizationResults = {};
        this.isGenerating = false;
    }

    // Generate optimized meal plan using Spoonacular API
    async generateOptimizedMealPlan(constraints = {}) {
        if (this.isGenerating) {
            console.log('Meal plan generation already in progress');
            return null;
        }

        this.isGenerating = true;
        this.planningConstraints = {
            targetCalories: constraints.targetCalories || 2000,
            diet: constraints.diet || '',
            exclude: constraints.exclude || '',
            timeFrame: 'week',
            ...constraints
        };

        try {
            console.log('Generating meal plan with constraints:', this.planningConstraints);
            
            // Use Spoonacular to generate meal plan
            const mealPlan = await this.generateWithSpoonacular();
            
            if (mealPlan) {
                // Optimize and validate the plan
                this.currentPlan = await this.optimizePlan(mealPlan);
                
                // Calculate optimization metrics
                this.optimizationResults = this.calculateOptimizationMetrics(this.currentPlan);
                
                // Save to Firebase
                if (window.firebaseManager && currentUser) {
                    await firebaseManager.saveMealPlan({
                        plan: this.currentPlan,
                        constraints: this.planningConstraints,
                        metrics: this.optimizationResults
                    });
                }
                
                return {
                    plan: this.currentPlan,
                    metrics: this.optimizationResults,
                    recommendations: this.generatePlanRecommendations()
                };
            }
            
            throw new Error('Failed to generate meal plan');
            
        } catch (error) {
            console.error('Error generating meal plan:', error);
            
            // Fallback to basic plan generation
            return this.generateFallbackPlan();
        } finally {
            this.isGenerating = false;
        }
    }

    async generateWithSpoonacular() {
        try {
            if (!window.spoonacularAPI) {
                throw new Error('Spoonacular API not available');
            }
            
            const mealPlan = await spoonacularAPI.generateMealPlan({
                timeFrame: 'week',
                targetCalories: this.planningConstraints.targetCalories,
                diet: this.planningConstraints.diet || undefined,
                exclude: this.planningConstraints.exclude || undefined
            });
            
            return mealPlan;
        } catch (error) {
            console.error('Error with Spoonacular meal plan generation:', error);
            throw error;
        }
    }

    async optimizePlan(rawPlan) {
        if (!rawPlan || !rawPlan.week) {
            throw new Error('Invalid meal plan structure');
        }

        const optimizedPlan = {
            week: {},
            totalNutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
            },
            totalCost: 0,
            variety: 0
        };

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        for (const day of days) {
            if (rawPlan.week[day]) {
                optimizedPlan.week[day] = await this.optimizeDayMeals(rawPlan.week[day], day);
                
                // Accumulate totals
                if (optimizedPlan.week[day].nutrition) {
                    optimizedPlan.totalNutrition.calories += optimizedPlan.week[day].nutrition.calories || 0;
                    optimizedPlan.totalNutrition.protein += optimizedPlan.week[day].nutrition.protein || 0;
                    optimizedPlan.totalNutrition.carbs += optimizedPlan.week[day].nutrition.carbs || 0;
                    optimizedPlan.totalNutrition.fat += optimizedPlan.week[day].nutrition.fat || 0;
                    optimizedPlan.totalNutrition.fiber += optimizedPlan.week[day].nutrition.fiber || 0;
                }
            }
        }

        // Calculate variety score
        optimizedPlan.variety = this.calculateVarietyScore(optimizedPlan.week);
        
        return optimizedPlan;
    }

    async optimizeDayMeals(dayData, dayName) {
        const optimizedDay = {
            meals: [],
            nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
            },
            cost: 0
        };

        if (dayData.meals && Array.isArray(dayData.meals)) {
            for (const meal of dayData.meals) {
                try {
                    // Get detailed nutrition information for each meal
                    const mealDetails = await this.getMealDetails(meal);
                    if (mealDetails) {
                        optimizedDay.meals.push(mealDetails);
                        
                        // Add to daily totals
                        if (mealDetails.nutrition) {
                            optimizedDay.nutrition.calories += mealDetails.nutrition.calories || 0;
                            optimizedDay.nutrition.protein += mealDetails.nutrition.protein || 0;
                            optimizedDay.nutrition.carbs += mealDetails.nutrition.carbs || 0;
                            optimizedDay.nutrition.fat += mealDetails.nutrition.fat || 0;
                            optimizedDay.nutrition.fiber += mealDetails.nutrition.fiber || 0;
                        }
                        
                        optimizedDay.cost += mealDetails.estimatedCost || 0;
                    }
                } catch (error) {
                    console.error(`Error optimizing meal for ${dayName}:`, error);
                    // Add basic meal info even if detailed lookup fails
                    optimizedDay.meals.push({
                        id: meal.id,
                        title: meal.title,
                        readyInMinutes: meal.readyInMinutes || 30,
                        servings: meal.servings || 2,
                        sourceUrl: meal.sourceUrl,
                        image: meal.image,
                        estimatedCost: 8.00,
                        nutrition: {
                            calories: 400,
                            protein: 20,
                            carbs: 40,
                            fat: 15,
                            fiber: 5
                        }
                    });
                }
            }
        }

        return optimizedDay;
    }

    async getMealDetails(meal) {
        try {
            if (meal.id && window.spoonacularAPI) {
                // Get detailed recipe information
                const details = await spoonacularAPI.getRecipeDetails(meal.id);
                if (details) {
                    return {
                        id: details.id,
                        title: details.title,
                        readyInMinutes: details.readyInMinutes,
                        servings: details.servings,
                        sourceUrl: details.sourceUrl,
                        image: details.image,
                        nutrition: details.nutrition,
                        ingredients: details.ingredients,
                        estimatedCost: this.estimateMealCost(details.ingredients)
                    };
                }
            }
            
            // Fallback to basic meal info
            return {
                id: meal.id,
                title: meal.title,
                readyInMinutes: meal.readyInMinutes || 30,
                servings: meal.servings || 2,
                sourceUrl: meal.sourceUrl,
                image: meal.image,
                estimatedCost: 8.00,
                nutrition: this.estimateNutrition(meal.title)
            };
        } catch (error) {
            console.error('Error getting meal details:', error);
            return null;
        }
    }

    estimateMealCost(ingredients) {
        if (!ingredients || !Array.isArray(ingredients)) {
            return 8.00; // Default cost
        }
        
        // Simple cost estimation based on ingredient count and types
        let totalCost = 0;
        
        ingredients.forEach(ingredient => {
            // Basic cost estimates by ingredient type
            const name = ingredient.name.toLowerCase();
            if (name.includes('meat') || name.includes('fish') || name.includes('chicken')) {
                totalCost += 4.00;
            } else if (name.includes('cheese') || name.includes('dairy')) {
                totalCost += 2.00;
            } else if (name.includes('vegetable') || name.includes('fruit')) {
                totalCost += 1.50;
            } else {
                totalCost += 1.00;
            }
        });
        
        return Math.max(3.00, Math.min(15.00, totalCost)); // Cap between $3-15
    }

    estimateNutrition(mealTitle) {
        const title = mealTitle.toLowerCase();
        
        // Basic nutrition estimation based on meal type keywords
        let nutrition = {
            calories: 400,
            protein: 20,
            carbs: 40,
            fat: 15,
            fiber: 5
        };
        
        // Adjust based on meal type
        if (title.includes('salad')) {
            nutrition = { calories: 250, protein: 15, carbs: 20, fat: 12, fiber: 8 };
        } else if (title.includes('soup')) {
            nutrition = { calories: 200, protein: 12, carbs: 25, fat: 6, fiber: 6 };
        } else if (title.includes('pasta')) {
            nutrition = { calories: 500, protein: 18, carbs: 70, fat: 15, fiber: 4 };
        } else if (title.includes('chicken')) {
            nutrition = { calories: 450, protein: 35, carbs: 20, fat: 18, fiber: 3 };
        } else if (title.includes('fish') || title.includes('salmon')) {
            nutrition = { calories: 380, protein: 30, carbs: 15, fat: 20, fiber: 2 };
        } else if (title.includes('vegetarian') || title.includes('veggie')) {
            nutrition = { calories: 350, protein: 15, carbs: 50, fat: 10, fiber: 12 };
        }
        
        return nutrition;
    }

    calculateVarietyScore(weekPlan) {
        const usedIngredients = new Set();
        const cuisineTypes = new Set();
        let varietyScore = 0;
        
        Object.values(weekPlan).forEach(day => {
            if (day.meals) {
                day.meals.forEach(meal => {
                    // Track unique ingredients
                    if (meal.ingredients) {
                        meal.ingredients.forEach(ing => {
                            usedIngredients.add(ing.name);
                        });
                    }
                    
                    // Track cuisine variety (estimated from meal title)
                    const cuisine = this.estimateCuisine(meal.title);
                    if (cuisine) {
                        cuisineTypes.add(cuisine);
                    }
                });
            }
        });
        
        // Calculate variety score
        varietyScore += usedIngredients.size * 2; // Points for ingredient variety
        varietyScore += cuisineTypes.size * 10; // Points for cuisine variety
        
        return Math.min(100, varietyScore);
    }

    estimateCuisine(mealTitle) {
        const title = mealTitle.toLowerCase();
        
        if (title.includes('pasta') || title.includes('italian')) return 'italian';
        if (title.includes('curry') || title.includes('indian')) return 'indian';
        if (title.includes('stir') || title.includes('asian') || title.includes('chinese')) return 'asian';
        if (title.includes('taco') || title.includes('mexican')) return 'mexican';
        if (title.includes('greek') || title.includes('mediterranean')) return 'mediterranean';
        if (title.includes('french')) return 'french';
        
        return 'american'; // Default
    }

    generateFallbackPlan() {
        console.log('Generating fallback meal plan');
        
        const fallbackMeals = [
            { id: 'fb1', title: 'Grilled Chicken Salad', readyInMinutes: 20, cost: 8 },
            { id: 'fb2', title: 'Salmon with Vegetables', readyInMinutes: 25, cost: 12 },
            { id: 'fb3', title: 'Quinoa Buddha Bowl', readyInMinutes: 30, cost: 7 },
            { id: 'fb4', title: 'Turkey and Avocado Wrap', readyInMinutes: 15, cost: 6 },
            { id: 'fb5', title: 'Vegetable Stir Fry', readyInMinutes: 20, cost: 5 },
            { id: 'fb6', title: 'Greek Yogurt Parfait', readyInMinutes: 5, cost: 4 },
            { id: 'fb7', title: 'Lentil Soup', readyInMinutes: 35, cost: 5 }
        ];
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const fallbackPlan = { week: {} };
        
        days.forEach((day, index) => {
            const mealsForDay = [
                fallbackMeals[index % fallbackMeals.length],
                fallbackMeals[(index + 1) % fallbackMeals.length],
                fallbackMeals[(index + 2) % fallbackMeals.length]
            ];
            
            fallbackPlan.week[day] = {
                meals: mealsForDay.map(meal => ({
                    ...meal,
                    nutrition: this.estimateNutrition(meal.title),
                    estimatedCost: meal.cost
                }))
            };
        });
        
        this.currentPlan = fallbackPlan;
        this.optimizationResults = {
            nutritionScore: 75,
            costEfficiency: 80,
            varietyScore: 65,
            overallScore: 73
        };
        
        return {
            plan: this.currentPlan,
            metrics: this.optimizationResults,
            recommendations: [
                { type: 'info', message: 'Basic meal plan generated. Consider upgrading for AI optimization.' }
            ]
        };
    }

    calculateOptimizationMetrics(plan) {
        if (!plan || !plan.week) {
            return { overallScore: 0, nutritionScore: 0, costEfficiency: 0, varietyScore: 0 };
        }

        const targetWeeklyCalories = this.planningConstraints.targetCalories * 7;
        const actualCalories = plan.totalNutrition?.calories || 0;
        
        // Nutrition score (0-100)
        const calorieAccuracy = Math.max(0, 100 - Math.abs(actualCalories - targetWeeklyCalories) / targetWeeklyCalories * 100);
        const proteinAdequacy = Math.min(100, (plan.totalNutrition?.protein || 0) / (150 * 7) * 100);
        const fiberAdequacy = Math.min(100, (plan.totalNutrition?.fiber || 0) / (25 * 7) * 100);
        const nutritionScore = (calorieAccuracy + proteinAdequacy + fiberAdequacy) / 3;
        
        // Cost efficiency (0-100)
        const avgMealCost = plan.totalCost / 21; // 3 meals * 7 days
        const costEfficiency = Math.max(0, 100 - (avgMealCost - 6) * 10); // $6 target per meal
        
        // Variety score
        const varietyScore = plan.variety || 0;
        
        // Overall score
        const overallScore = (nutritionScore * 0.4 + costEfficiency * 0.3 + varietyScore * 0.3);
        
        return {
            overallScore: Math.round(overallScore),
            nutritionScore: Math.round(nutritionScore),
            costEfficiency: Math.round(costEfficiency),
            varietyScore: Math.round(varietyScore),
            totalCost: plan.totalCost || 0,
            totalCalories: actualCalories,
            mealsCount: this.countMeals(plan.week)
        };
    }

    countMeals(weekPlan) {
        let count = 0;
        Object.values(weekPlan).forEach(day => {
            if (day.meals) {
                count += day.meals.length;
            }
        });
        return count;
    }

    generatePlanRecommendations() {
        const metrics = this.optimizationResults;
        const recommendations = [];
        
        if (metrics.nutritionScore < 70) {
            recommendations.push({
                type: 'nutrition',
                message: 'Consider adding more protein-rich foods and vegetables for better nutrition balance.',
                priority: 'high'
            });
        }
        
        if (metrics.costEfficiency < 60) {
            recommendations.push({
                type: 'budget',
                message: 'Look for budget-friendly alternatives or consider meal prep to reduce costs.',
                priority: 'medium'
            });
        }
        
        if (metrics.varietyScore < 50) {
            recommendations.push({
                type: 'variety',
                message: 'Try incorporating more diverse cuisines and ingredients for better variety.',
                priority: 'medium'
            });
        }
        
        if (metrics.overallScore > 85) {
            recommendations.push({
                type: 'positive',
                message: 'Excellent meal plan! Great balance of nutrition, cost, and variety.',
                priority: 'info'
            });
        }
        
        return recommendations;
    }

    // Generate shopping list from current meal plan
    async generateShoppingList() {
        if (!this.currentPlan || !this.currentPlan.week) {
            return [];
        }

        const shoppingList = {};
        const categories = ['produce', 'proteins', 'dairy', 'pantry', 'other'];
        
        // Initialize categories
        categories.forEach(category => {
            shoppingList[category] = [];
        });

        // Collect all ingredients from the meal plan
        Object.values(this.currentPlan.week).forEach(day => {
            if (day.meals) {
                day.meals.forEach(meal => {
                    if (meal.ingredients && Array.isArray(meal.ingredients)) {
                        meal.ingredients.forEach(ingredient => {
                            const category = this.categorizeIngredient(ingredient.name);
                            const existingItem = shoppingList[category].find(item => 
                                item.name.toLowerCase() === ingredient.name.toLowerCase()
                            );
                            
                            if (existingItem) {
                                existingItem.quantity += ingredient.amount || 1;
                            } else {
                                shoppingList[category].push({
                                    name: ingredient.name,
                                    quantity: ingredient.amount || 1,
                                    unit: ingredient.unit || 'item',
                                    estimatedCost: this.estimateIngredientCost(ingredient.name)
                                });
                            }
                        });
                    }
                });
            }
        });

        // Remove empty categories and calculate totals
        const finalList = {};
        let totalCost = 0;
        
        categories.forEach(category => {
            if (shoppingList[category].length > 0) {
                finalList[category] = shoppingList[category];
                totalCost += shoppingList[category].reduce((sum, item) => sum + item.estimatedCost, 0);
            }
        });

        // Save to Firebase if available
        if (window.firebaseManager && currentUser) {
            try {
                await firebaseManager.saveShoppingList({
                    items: finalList,
                    totalCost: totalCost,
                    mealPlanId: 'current',
                    weekOf: new Date().toISOString().split('T')[0]
                });
            } catch (error) {
                console.error('Error saving shopping list:', error);
            }
        }

        return {
            items: finalList,
            totalCost: totalCost,
            estimatedTime: this.estimateShoppingTime(finalList)
        };
    }

    categorizeIngredient(ingredientName) {
        const name = ingredientName.toLowerCase();
        
        // Produce
        if (name.includes('lettuce') || name.includes('spinach') || name.includes('tomato') || 
            name.includes('onion') || name.includes('pepper') || name.includes('carrot') ||
            name.includes('broccoli') || name.includes('cucumber') || name.includes('fruit')) {
            return 'produce';
        }
        
        // Proteins
        if (name.includes('chicken') || name.includes('beef') || name.includes('fish') || 
            name.includes('salmon') || name.includes('egg') || name.includes('tofu') ||
            name.includes('beans') || name.includes('lentil')) {
            return 'proteins';
        }
        
        // Dairy
        if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
            name.includes('butter') || name.includes('cream')) {
            return 'dairy';
        }
        
        // Pantry items
        if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || 
            name.includes('flour') || name.includes('oil') || name.includes('spice') ||
            name.includes('salt') || name.includes('sugar') || name.includes('vinegar')) {
            return 'pantry';
        }
        
        return 'other';
    }

    estimateIngredientCost(ingredientName) {
        const name = ingredientName.toLowerCase();
        
        // Cost estimates based on ingredient type
        if (name.includes('meat') || name.includes('fish') || name.includes('salmon')) {
            return Math.random() * 5 + 5; // $5-10
        } else if (name.includes('cheese') || name.includes('dairy')) {
            return Math.random() * 3 + 2; // $2-5
        } else if (name.includes('vegetable') || name.includes('fruit')) {
            return Math.random() * 2 + 1; // $1-3
        } else {
            return Math.random() * 2 + 0.5; // $0.50-2.50
        }
    }

    estimateShoppingTime(shoppingList) {
        const itemCount = Object.values(shoppingList).reduce((total, category) => 
            total + category.length, 0
        );
        
        // Base time + time per item + category switching time
        return Math.max(15, 10 + itemCount * 2 + Object.keys(shoppingList).length * 3);
    }

    // Get current meal plan summary
    getMealPlanSummary() {
        return {
            plan: this.currentPlan,
            metrics: this.optimizationResults,
            constraints: this.planningConstraints,
            recommendations: this.generatePlanRecommendations(),
            isValid: this.currentPlan !== null
        };
    }

    // Load existing meal plan
    async loadMealPlan() {
        try {
            if (window.firebaseManager && currentUser) {
                const existingPlan = await firebaseManager.getCurrentMealPlan();
                if (existingPlan) {
                    this.currentPlan = existingPlan.plan;
                    this.planningConstraints = existingPlan.constraints || {};
                    this.optimizationResults = existingPlan.metrics || {};
                    return true;
                }
            }
        } catch (error) {
            console.error('Error loading meal plan:', error);
        }
        return false;
    }
}

// Initialize meal planner
const mealPlanner = new MealPlanner();

// Export for global use
window.mealPlanner = mealPlanner;

console.log('Meal planner loaded');