// AI-Powered Meal Planner
class MealPlanner {
    constructor() {
        this.mealPlans = [];
        this.preferences = {
            dailyCalories: 2000,
            budget: 50,
            familySize: 2,
            dietaryRestrictions: [],
            cuisinePreferences: [],
            cookingTime: 45,
            mealPrepDays: 3
        };
        this.currentPlan = null;
        this.planningConstraints = {};
        
        this.initializePlanner();
    }

    initializePlanner() {
        this.loadUserPreferences();
        this.loadExistingPlans();
        this.setupEventListeners();
        console.log('Meal Planner initialized');
    }

    async loadUserPreferences() {
        try {
            if (window.firebaseConfig?.helper) {
                const saved = await window.firebaseConfig.helper.getUserData('mealPlanPreferences');
                if (saved) {
                    this.preferences = { ...this.preferences, ...saved };
                    this.updatePreferencesUI();
                }
            }
        } catch (error) {
            console.error('Error loading meal plan preferences:', error);
        }
    }

    async loadExistingPlans() {
        try {
            if (window.firebaseConfig?.helper) {
                this.mealPlans = await window.firebaseConfig.helper.getUserDocuments('mealPlans') || [];
                this.displayExistingPlans();
            }
        } catch (error) {
            console.error('Error loading existing meal plans:', error);
        }
    }

    setupEventListeners() {
        // Plan generation button
        const generateBtn = document.getElementById('generatePlanBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateMealPlan());
        }

        // Preference updates
        const preferenceInputs = document.querySelectorAll('.preference-input');
        preferenceInputs.forEach(input => {
            input.addEventListener('change', () => this.updatePreferences());
        });

        // Meal plan actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('regenerate-day')) {
                const day = e.target.dataset.day;
                this.regenerateDay(day);
            }
            
            if (e.target.classList.contains('save-plan')) {
                this.saveMealPlan();
            }
            
            if (e.target.classList.contains('export-plan')) {
                this.exportMealPlan();
            }
        });
    }

    updatePreferencesUI() {
        // Update form fields with saved preferences
        Object.entries(this.preferences).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else if (Array.isArray(value)) {
                    input.value = value.join(',');
                } else {
                    input.value = value;
                }
            }
        });
    }

    async updatePreferences() {
        try {
            // Collect preferences from form
            const newPreferences = {
                dailyCalories: parseInt(document.getElementById('dailyCalories')?.value) || 2000,
                budget: parseFloat(document.getElementById('budget')?.value) || 50,
                familySize: parseInt(document.getElementById('familySize')?.value) || 2,
                cookingTime: parseInt(document.getElementById('cookingTime')?.value) || 45,
                mealPrepDays: parseInt(document.getElementById('mealPrepDays')?.value) || 3
            };

            // Get dietary restrictions
            const dietCheckboxes = document.querySelectorAll('input[name="dietaryRestrictions"]:checked');
            newPreferences.dietaryRestrictions = Array.from(dietCheckboxes).map(cb => cb.value);

            // Get cuisine preferences
            const cuisineCheckboxes = document.querySelectorAll('input[name="cuisinePreferences"]:checked');
            newPreferences.cuisinePreferences = Array.from(cuisineCheckboxes).map(cb => cb.value);

            this.preferences = { ...this.preferences, ...newPreferences };

            // Save to Firebase
            if (window.firebaseConfig?.helper) {
                await window.firebaseConfig.helper.saveUserData('mealPlanPreferences', this.preferences);
            }

            this.showSuccess('Preferences updated successfully!');
        } catch (error) {
            console.error('Error updating preferences:', error);
            this.showError('Failed to update preferences');
        }
    }

    async generateMealPlan() {
        try {
            this.showLoading('Generating your optimized meal plan...');

            // Get planning parameters
            const planType = document.getElementById('planType')?.value || 'week';
            const startDate = document.getElementById('startDate')?.value || new Date().toISOString().split('T')[0];

            this.planningConstraints = {
                ...this.preferences,
                planType,
                startDate,
                includeBreakfast: document.getElementById('includeBreakfast')?.checked || true,
                includeLunch: document.getElementById('includeLunch')?.checked || true,
                includeDinner: document.getElementById('includeDinner')?.checked || true,
                includeSnacks: document.getElementById('includeSnacks')?.checked || false
            };

            let mealPlan;

            // Try Spoonacular API first
            if (window.spoonacularAPI) {
                try {
                    mealPlan = await this.generateWithSpoonacular();
                } catch (error) {
                    console.warn('Spoonacular API failed, using AI fallback');
                    mealPlan = await this.generateWithAI();
                }
            } else {
                mealPlan = await this.generateWithAI();
            }

            this.currentPlan = mealPlan;
            this.displayMealPlan(mealPlan);
            this.calculatePlanMetrics(mealPlan);
            
            this.hideLoading();
            this.showSuccess('Meal plan generated successfully!');

        } catch (error) {
            console.error('Error generating meal plan:', error);
            this.hideLoading();
            this.showError('Failed to generate meal plan');
        }
    }

    async generateWithSpoonacular() {
        const timeFrame = this.planningConstraints.planType === 'week' ? 'week' : 'day';
        const targetCalories = this.planningConstraints.dailyCalories;
        const diet = this.planningConstraints.dietaryRestrictions.join(',');

        const spoonacularPlan = await window.spoonacularAPI.generateMealPlan(
            timeFrame, 
            targetCalories, 
            diet
        );

        return this.convertSpoonacularPlan(spoonacularPlan);
    }

    convertSpoonacularPlan(spoonacularPlan) {
        // Convert Spoonacular format to our format
        const days = spoonacularPlan.week ? Object.keys(spoonacularPlan.week) : ['today'];
        
        return {
            id: Date.now(),
            type: this.planningConstraints.planType,
            startDate: this.planningConstraints.startDate,
            days: days.map(day => ({
                day: day,
                date: this.calculateDate(day),
                meals: this.createDayMeals(spoonacularPlan.week ? spoonacularPlan.week[day] : spoonacularPlan)
            })),
            metrics: {
                totalCalories: spoonacularPlan.nutrients?.calories || 0,
                totalCost: this.estimatePlanCost(),
                averageTime: this.estimateAverageTime(),
                varietyScore: this.calculateVarietyScore()
            },
            createdAt: new Date().toISOString()
        };
    }

    async generateWithAI() {
        // Use genetic algorithm for optimization
        if (window.recipeAI) {
            const aiResult = window.recipeAI.generateOptimalMealPlan(this.planningConstraints, 7);
            return this.convertAIPlan(aiResult);
        }

        // Fallback to rule-based generation
        return this.generateRuleBasedPlan();
    }

    convertAIPlan(aiResult) {
        return {
            id: Date.now(),
            type: this.planningConstraints.planType,
            startDate: this.planningConstraints.startDate,
            days: aiResult.mealPlan.map((day, index) => ({
                day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
                date: this.calculateDate(index),
                meals: day.meals.map(meal => ({
                    type: meal.type,
                    recipe: meal.recipe,
                    calories: meal.recipe.calories,
                    protein: meal.recipe.protein,
                    carbs: meal.recipe.carbs,
                    fat: meal.recipe.fat,
                    cookingTime: meal.recipe.cookingTime,
                    cost: meal.recipe.estimatedCost
                }))
            })),
            metrics: aiResult.metrics,
            fitness: aiResult.fitness,
            processingTime: aiResult.processingTime,
            createdAt: new Date().toISOString()
        };
    }

    generateRuleBasedPlan() {
        const days = this.planningConstraints.planType === 'week' ? 7 : 
                    this.planningConstraints.planType === 'month' ? 30 : 1;

        const plan = {
            id: Date.now(),
            type: this.planningConstraints.planType,
            startDate: this.planningConstraints.startDate,
            days: [],
            metrics: {},
            createdAt: new Date().toISOString()
        };

        for (let i = 0; i < days; i++) {
            const dayPlan = this.generateDayPlan(i);
            plan.days.push(dayPlan);
        }

        plan.metrics = this.calculatePlanMetrics(plan);
        return plan;
    }

    generateDayPlan(dayIndex) {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const day = {
            day: dayNames[dayIndex % 7],
            date: this.calculateDate(dayIndex),
            meals: []
        };

        const targetCalories = this.planningConstraints.dailyCalories;
        const calorieDistribution = {
            breakfast: 0.25,
            lunch: 0.35,
            dinner: 0.35,
            snacks: 0.05
        };

        if (this.planningConstraints.includeBreakfast) {
            day.meals.push(this.generateMeal('breakfast', targetCalories * calorieDistribution.breakfast));
        }

        if (this.planningConstraints.includeLunch) {
            day.meals.push(this.generateMeal('lunch', targetCalories * calorieDistribution.lunch));
        }

        if (this.planningConstraints.includeDinner) {
            day.meals.push(this.generateMeal('dinner', targetCalories * calorieDistribution.dinner));
        }

        if (this.planningConstraints.includeSnacks) {
            day.meals.push(this.generateMeal('snack', targetCalories * calorieDistribution.snacks));
        }

        return day;
    }

    generateMeal(mealType, targetCalories) {
        // Get suitable recipes for this meal type
        let suitableRecipes = [];
        
        if (window.recipeAI) {
            suitableRecipes = window.recipeAI.recipes.filter(recipe => {
                // Filter by meal type appropriateness
                if (mealType === 'breakfast' && !recipe.tags.includes('breakfast')) {
                    return recipe.cookingTime <= 20 && recipe.calories <= 400;
                }
                if (mealType === 'lunch' && recipe.calories > targetCalories * 1.5) {
                    return false;
                }
                if (mealType === 'dinner' && recipe.calories < targetCalories * 0.6) {
                    return false;
                }
                if (mealType === 'snack' && recipe.calories > 200) {
                    return false;
                }

                // Check dietary restrictions
                if (this.planningConstraints.dietaryRestrictions.includes('vegetarian')) {
                    return !recipe.ingredients.some(ing => 
                        ['chicken', 'beef', 'fish', 'salmon', 'turkey'].includes(ing)
                    );
                }

                return true;
            });
        }

        // Fallback recipes if no AI recipes available
        if (suitableRecipes.length === 0) {
            suitableRecipes = this.getFallbackRecipes(mealType);
        }

        // Select best recipe for this meal
        const selectedRecipe = this.selectBestRecipe(suitableRecipes, targetCalories);

        return {
            type: mealType,
            recipe: selectedRecipe,
            calories: selectedRecipe.calories,
            protein: selectedRecipe.protein,
            carbs: selectedRecipe.carbs,
            fat: selectedRecipe.fat,
            cookingTime: selectedRecipe.cookingTime,
            cost: selectedRecipe.estimatedCost || 8
        };
    }

    getFallbackRecipes(mealType) {
        const fallbackRecipes = {
            breakfast: [
                { id: 'b1', title: 'Greek Yogurt Parfait', calories: 250, protein: 20, carbs: 25, fat: 5, cookingTime: 5, estimatedCost: 4 },
                { id: 'b2', title: 'Scrambled Eggs with Toast', calories: 320, protein: 18, carbs: 22, fat: 18, cookingTime: 10, estimatedCost: 3 },
                { id: 'b3', title: 'Protein Smoothie', calories: 280, protein: 25, carbs: 20, fat: 8, cookingTime: 5, estimatedCost: 5 }
            ],
            lunch: [
                { id: 'l1', title: 'Quinoa Buddha Bowl', calories: 380, protein: 16, carbs: 52, fat: 12, cookingTime: 25, estimatedCost: 8 },
                { id: 'l2', title: 'Turkey Wrap', calories: 350, protein: 25, carbs: 28, fat: 16, cookingTime: 10, estimatedCost: 6 },
                { id: 'l3', title: 'Chicken Salad', calories: 320, protein: 28, carbs: 15, fat: 18, cookingTime: 15, estimatedCost: 9 }
            ],
            dinner: [
                { id: 'd1', title: 'Grilled Salmon with Vegetables', calories: 420, protein: 35, carbs: 20, fat: 24, cookingTime: 30, estimatedCost: 16 },
                { id: 'd2', title: 'Chicken Stir-fry', calories: 380, protein: 32, carbs: 25, fat: 18, cookingTime: 25, estimatedCost: 12 },
                { id: 'd3', title: 'Lentil Curry', calories: 310, protein: 18, carbs: 45, fat: 6, cookingTime: 40, estimatedCost: 5 }
            ],
            snack: [
                { id: 's1', title: 'Mixed Nuts', calories: 160, protein: 6, carbs: 6, fat: 14, cookingTime: 0, estimatedCost: 2 },
                { id: 's2', title: 'Apple with Peanut Butter', calories: 190, protein: 8, carbs: 20, fat: 8, cookingTime: 2, estimatedCost: 2 },
                { id: 's3', title: 'Protein Bar', calories: 200, protein: 15, carbs: 20, fat: 8, cookingTime: 0, estimatedCost: 3 }
            ]
        };

        return fallbackRecipes[mealType] || fallbackRecipes.lunch;
    }

    selectBestRecipe(recipes, targetCalories) {
        if (recipes.length === 0) {
            return this.getFallbackRecipes('lunch')[0];
        }

        // Score recipes based on how well they match target calories and preferences
        const scoredRecipes = recipes.map(recipe => {
            let score = 0;

            // Calorie proximity (closer to target = higher score)
            const calorieDiff = Math.abs(recipe.calories - targetCalories);
            score += Math.max(0, 100 - calorieDiff);

            // Cooking time preference
            if (recipe.cookingTime <= this.planningConstraints.cookingTime) {
                score += 50;
            }

            // Cost preference
            if (recipe.estimatedCost <= this.planningConstraints.budget / 3) {
                score += 30;
            }

            // Protein content
            if (recipe.protein >= 15) {
                score += 25;
            }

            return { ...recipe, score };
        });

        // Return highest scoring recipe
        scoredRecipes.sort((a, b) => b.score - a.score);
        return scoredRecipes[0];
    }

    calculateDate(dayIndex) {
        const startDate = new Date(this.planningConstraints.startDate);
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayIndex);
        return targetDate.toISOString().split('T')[0];
    }

    createDayMeals(dayData) {
        // Convert day data to our meal format
        const meals = [];
        
        if (dayData.breakfast) meals.push({ type: 'breakfast', ...dayData.breakfast });
        if (dayData.lunch) meals.push({ type: 'lunch', ...dayData.lunch });
        if (dayData.dinner) meals.push({ type: 'dinner', ...dayData.dinner });
        
        return meals;
    }

    displayMealPlan(plan) {
        const container = document.getElementById('mealPlanResults');
        if (!container) return;

        container.innerHTML = `
            <div class="meal-plan-header mb-4">
                <h4>Your ${plan.type} Meal Plan</h4>
                <p class="text-muted">Generated on ${new Date(plan.createdAt).toLocaleDateString()}</p>
                <div class="plan-actions">
                    <button class="btn btn-primary save-plan">Save Plan</button>
                    <button class="btn btn-outline-secondary export-plan">Export</button>
                    <button class="btn btn-outline-info" onclick="mealPlanner.showPlanAnalytics()">View Analytics</button>
                </div>
            </div>
            
            <div class="meal-plan-grid">
                ${plan.days.map(day => this.renderDayPlan(day)).join('')}
            </div>
            
            <div class="plan-summary mt-4">
                ${this.renderPlanSummary(plan)}
            </div>
        `;
    }

    renderDayPlan(day) {
        return `
            <div class="day-plan card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${day.day}</h5>
                    <small class="text-muted">${new Date(day.date).toLocaleDateString()}</small>
                    <button class="btn btn-sm btn-outline-primary regenerate-day" data-day="${day.day}">
                        <i class="fas fa-sync-alt me-1"></i>Regenerate
                    </button>
                </div>
                <div class="card-body">
                    <div class="meals-list">
                        ${day.meals.map(meal => this.renderMeal(meal)).join('')}
                    </div>
                    <div class="day-totals mt-3 pt-3 border-top">
                        <div class="row text-center">
                            <div class="col">
                                <strong>${this.calculateDayCalories(day.meals)}</strong>
                                <br><small class="text-muted">Calories</small>
                            </div>
                            <div class="col">
                                <strong>${this.calculateDayProtein(day.meals)}g</strong>
                                <br><small class="text-muted">Protein</small>
                            </div>
                            <div class="col">
                                <strong>$${this.calculateDayCost(day.meals)}</strong>
                                <br><small class="text-muted">Est. Cost</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMeal(meal) {
        return `
            <div class="meal-item d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <div class="fw-semibold text-capitalize">${meal.type}</div>
                    <div class="recipe-name">${meal.recipe.title}</div>
                    <small class="text-muted">
                        ${meal.cookingTime} min • ${meal.calories} cal • ${meal.protein}g protein
                    </small>
                </div>
                <div class="meal-actions">
                    <button class="btn btn-sm btn-outline-secondary" onclick="mealPlanner.viewRecipe('${meal.recipe.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="mealPlanner.replaceMeal('${meal.type}', '${meal.recipe.id}')">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderPlanSummary(plan) {
        return `
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card text-center">
                        <h3 class="stat-number">${plan.metrics.totalCalories || 'N/A'}</h3>
                        <div class="stat-label">Total Calories</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card text-center">
                        <h3 class="stat-number">$${plan.metrics.totalCost || 'N/A'}</h3>
                        <div class="stat-label">Est. Total Cost</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card text-center">
                        <h3 class="stat-number">${plan.metrics.averageTime || 'N/A'} min</h3>
                        <div class="stat-label">Avg. Cook Time</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card text-center">
                        <h3 class="stat-number">${Math.round((plan.metrics.varietyScore || 0) * 100)}%</h3>
                        <div class="stat-label">Variety Score</div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateDayCalories(meals) {
        return Math.round(meals.reduce((total, meal) => total + (meal.calories || 0), 0));
    }

    calculateDayProtein(meals) {
        return Math.round(meals.reduce((total, meal) => total + (meal.protein || 0), 0));
    }

    calculateDayCost(meals) {
        return meals.reduce((total, meal) => total + (meal.cost || 0), 0).toFixed(2);
    }

    calculatePlanMetrics(plan) {
        const totalCalories = plan.days.reduce((total, day) => 
            total + this.calculateDayCalories(day.meals), 0);
        const totalCost = plan.days.reduce((total, day) => 
            total + parseFloat(this.calculateDayCost(day.meals)), 0);
        const totalTime = plan.days.reduce((total, day) => 
            total + day.meals.reduce((dayTime, meal) => dayTime + (meal.cookingTime || 0), 0), 0);

        const allRecipes = plan.days.flatMap(day => day.meals.map(meal => meal.recipe.id || meal.recipe.title));
        const uniqueRecipes = new Set(allRecipes);
        const varietyScore = uniqueRecipes.size / allRecipes.length;

        plan.metrics = {
            totalCalories,
            totalCost: totalCost.toFixed(2),
            averageTime: Math.round(totalTime / plan.days.length),
            varietyScore,
            uniqueRecipes: uniqueRecipes.size,
            totalRecipes: allRecipes.length
        };

        return plan.metrics;
    }

    async regenerateDay(dayName) {
        if (!this.currentPlan) return;

        try {
            this.showLoading(`Regenerating ${dayName}...`);

            const dayIndex = this.currentPlan.days.findIndex(d => d.day === dayName);
            if (dayIndex !== -1) {
                const newDayPlan = this.generateDayPlan(dayIndex);
                this.currentPlan.days[dayIndex] = newDayPlan;
                
                this.calculatePlanMetrics(this.currentPlan);
                this.displayMealPlan(this.currentPlan);
            }

            this.hideLoading();
            this.showSuccess(`${dayName} regenerated successfully!`);
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to regenerate ${dayName}`);
        }
    }

    async saveMealPlan() {
        if (!this.currentPlan) return;

        try {
            // Save to Firebase
            if (window.firebaseConfig?.helper) {
                const planId = await window.firebaseConfig.helper.addDocument('savedMealPlans', this.currentPlan);
                this.currentPlan.id = planId;
            }

            // Add to local collection
            this.mealPlans.push(this.currentPlan);
            this.displayExistingPlans();

            this.showSuccess('Meal plan saved successfully!');
        } catch (error) {
            console.error('Error saving meal plan:', error);
            this.showError('Failed to save meal plan');
        }
    }

    exportMealPlan() {
        if (!this.currentPlan) return;

        const exportData = {
            ...this.currentPlan,
            exportedAt: new Date().toISOString(),
            preferences: this.preferences
        };

        // Create shopping list
        const shoppingList = this.generateShoppingList(this.currentPlan);
        exportData.shoppingList = shoppingList;

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meal-plan-${this.currentPlan.startDate}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showSuccess('Meal plan exported successfully!');
    }

    generateShoppingList(plan) {
        const ingredients = new Map();

        plan.days.forEach(day => {
            day.meals.forEach(meal => {
                if (meal.recipe.ingredients) {
                    meal.recipe.ingredients.forEach(ingredient => {
                        if (ingredients.has(ingredient)) {
                            ingredients.set(ingredient, ingredients.get(ingredient) + 1);
                        } else {
                            ingredients.set(ingredient, 1);
                        }
                    });
                }
            });
        });

        return Array.from(ingredients.entries()).map(([ingredient, quantity]) => ({
            item: ingredient,
            quantity: quantity,
            category: this.categorizeIngredient(ingredient),
            estimated: true
        }));
    }

    categorizeIngredient(ingredient) {
        const categories = {
            'meat': ['chicken', 'beef', 'turkey', 'fish', 'salmon'],
            'dairy': ['milk', 'cheese', 'yogurt', 'butter'],
            'vegetables': ['broccoli', 'spinach', 'tomatoes', 'onion', 'garlic'],
            'fruits': ['apple', 'banana', 'berries', 'lemon'],
            'grains': ['rice', 'quinoa', 'bread', 'pasta'],
            'pantry': ['oil', 'spices', 'herbs', 'salt', 'pepper']
        };

        for (const [category, items] of Object.entries(categories)) {
            if (items.some(item => ingredient.toLowerCase().includes(item))) {
                return category;
            }
        }

        return 'other';
    }

    displayExistingPlans() {
        const container = document.getElementById('existingPlans');
        if (!container || this.mealPlans.length === 0) return;

        container.innerHTML = `
            <h5>Saved Meal Plans</h5>
            <div class="saved-plans-list">
                ${this.mealPlans.slice(-5).map(plan => `
                    <div class="saved-plan-item d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                            <div class="fw-semibold">${plan.type} Plan - ${plan.startDate}</div>
                            <small class="text-muted">
                                ${plan.days.length} days • ${plan.metrics.totalCalories} cal • $${plan.metrics.totalCost}
                            </small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="mealPlanner.loadPlan('${plan.id}')">
                                Load
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadPlan(planId) {
        const plan = this.mealPlans.find(p => p.id === planId);
        if (plan) {
            this.currentPlan = plan;
            this.displayMealPlan(plan);
            this.showSuccess('Meal plan loaded successfully!');
        }
    }

    showPlanAnalytics() {
        if (!this.currentPlan) return;

        // Create analytics modal or display
        if (window.chartManager) {
            // Create nutrition breakdown chart
            const nutritionData = this.analyzePlanNutrition();
            window.chartManager.createNutritionChart('planNutritionChart', nutritionData);

            // Create cost analysis chart
            const costData = this.analyzePlanCosts();
            window.chartManager.createMealPlanChart('planCostChart', costData);
        }
    }

    analyzePlanNutrition() {
        const totals = this.currentPlan.days.reduce((acc, day) => {
            day.meals.forEach(meal => {
                acc.protein += meal.protein || 0;
                acc.carbs += meal.carbs || 0;
                acc.fat += meal.fat || 0;
            });
            return acc;
        }, { protein: 0, carbs: 0, fat: 0 });

        return {
            title: 'Plan Nutrition Breakdown',
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat)
        };
    }

    analyzePlanCosts() {
        return {
            optimized: [
                { name: 'Current Plan', value: [85, this.currentPlan.metrics.totalCost, 150] }
            ],
            alternatives: []
        };
    }

    showLoading(message) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <div>${message}</div>
                </div>
            `;
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize meal planner
const mealPlanner = new MealPlanner();

// Export for global use
window.mealPlanner = mealPlanner;

console.log('Meal Planner loaded successfully');