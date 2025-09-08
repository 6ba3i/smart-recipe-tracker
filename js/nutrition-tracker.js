/**
 * Nutrition Tracker with Spoonacular API Integration
 * Handles nutrition logging, tracking, and analysis
 */

class NutritionTracker {
    constructor() {
        this.dailyGoals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fat: 70,
            fiber: 25,
            sugar: 50
        };
        
        this.currentIntake = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
        };
        
        this.mealHistory = [];
        this.listeners = [];
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Load user preferences and goals
            await this.loadUserGoals();
            
            // Load today's nutrition data
            await this.loadTodaysNutrition();
            
            // Set up real-time listeners
            this.setupRealtimeListeners();
            
            this.isInitialized = true;
            console.log('Nutrition tracker initialized');
        } catch (error) {
            console.error('Error initializing nutrition tracker:', error);
        }
    }

    async loadUserGoals() {
        try {
            if (window.firebaseManager && currentUser) {
                const preferences = await firebaseManager.getUserPreferences();
                
                if (preferences.dailyCalories) {
                    this.dailyGoals.calories = preferences.dailyCalories;
                }
                if (preferences.dailyProtein) {
                    this.dailyGoals.protein = preferences.dailyProtein;
                }
                if (preferences.dailyCarbs) {
                    this.dailyGoals.carbs = preferences.dailyCarbs;
                }
                if (preferences.dailyFat) {
                    this.dailyGoals.fat = preferences.dailyFat;
                }
            }
        } catch (error) {
            console.error('Error loading user goals:', error);
        }
    }

    async loadTodaysNutrition() {
        try {
            if (window.firebaseManager && currentUser) {
                const today = new Date().toISOString().split('T')[0];
                const summary = await firebaseManager.getDailyNutritionSummary(today);
                
                if (summary && summary.totals) {
                    this.currentIntake = { ...summary.totals };
                    this.mealHistory = summary.logs || [];
                    this.updateNutritionDisplays();
                }
            }
        } catch (error) {
            console.error('Error loading today\'s nutrition:', error);
        }
    }

    setupRealtimeListeners() {
        if (window.firebaseManager && currentUser) {
            // Listen for nutrition updates
            const unsubscribe = firebaseManager.listenToNutritionUpdates((logs) => {
                this.updateFromFirebaseLogs(logs);
            });
            
            if (unsubscribe) {
                this.listeners.push(unsubscribe);
            }
        }
    }

    updateFromFirebaseLogs(logs) {
        // Reset current intake
        this.currentIntake = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
        };
        
        // Sum up today's logs
        logs.forEach(log => {
            this.currentIntake.calories += log.calories || 0;
            this.currentIntake.protein += log.protein || 0;
            this.currentIntake.carbs += log.carbs || 0;
            this.currentIntake.fat += log.fat || 0;
            this.currentIntake.fiber += log.fiber || 0;
            this.currentIntake.sugar += log.sugar || 0;
        });
        
        this.mealHistory = logs;
        this.updateNutritionDisplays();
        
        // Update charts if available
        if (window.chartManager) {
            window.chartManager.updateNutritionChart(this.currentIntake);
        }
    }

    async searchFood(query) {
        try {
            if (!window.spoonacularAPI) {
                throw new Error('Spoonacular API not available');
            }
            
            const results = await spoonacularAPI.searchFood(query, 10);
            return results.map(food => ({
                id: food.id,
                name: food.name,
                image: food.image,
                score: this.calculateFoodScore(food)
            })).sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('Error searching food:', error);
            return this.fallbackFoodSearch(query);
        }
    }

    calculateFoodScore(food) {
        // Simple scoring based on name relevance
        let score = 50;
        
        // Boost score for common healthy foods
        const healthyTerms = ['vegetable', 'fruit', 'lean', 'whole', 'organic', 'fresh'];
        healthyTerms.forEach(term => {
            if (food.name.toLowerCase().includes(term)) {
                score += 10;
            }
        });
        
        return score;
    }

    fallbackFoodSearch(query) {
        // Basic fallback food database for when API is not available
        const basicFoods = [
            { id: 'chicken_breast', name: 'Chicken Breast', image: '' },
            { id: 'salmon', name: 'Salmon', image: '' },
            { id: 'eggs', name: 'Eggs', image: '' },
            { id: 'quinoa', name: 'Quinoa', image: '' },
            { id: 'brown_rice', name: 'Brown Rice', image: '' },
            { id: 'spinach', name: 'Spinach', image: '' },
            { id: 'broccoli', name: 'Broccoli', image: '' },
            { id: 'avocado', name: 'Avocado', image: '' },
            { id: 'banana', name: 'Banana', image: '' },
            { id: 'oats', name: 'Oats', image: '' }
        ];
        
        return basicFoods.filter(food => 
            food.name.toLowerCase().includes(query.toLowerCase())
        ).map(food => ({ ...food, score: 50 }));
    }

    async getFoodNutrition(foodId, servings = 1) {
        try {
            if (!window.spoonacularAPI) {
                throw new Error('Spoonacular API not available');
            }
            
            const nutrition = await spoonacularAPI.getFoodNutrition(foodId, servings);
            if (nutrition) {
                return {
                    id: nutrition.id,
                    name: nutrition.name,
                    servings: servings,
                    calories: nutrition.calories,
                    protein: nutrition.protein,
                    carbs: nutrition.carbs,
                    fat: nutrition.fat,
                    fiber: nutrition.fiber,
                    sugar: nutrition.sugar,
                    sodium: nutrition.sodium
                };
            }
        } catch (error) {
            console.error('Error getting food nutrition:', error);
        }
        
        // Fallback nutrition estimation
        return this.estimateNutrition(foodId, servings);
    }

    estimateNutrition(foodId, servings) {
        // Basic nutrition estimates for common foods
        const nutritionEstimates = {
            'chicken_breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
            'salmon': { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0, sugar: 0 },
            'eggs': { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.6 },
            'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sugar: 0.9 },
            'brown_rice': { calories: 112, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4 },
            'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
            'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5 },
            'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7 },
            'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
            'oats': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.4 }
        };
        
        const baseNutrition = nutritionEstimates[foodId] || { 
            calories: 200, protein: 10, carbs: 25, fat: 8, fiber: 3, sugar: 5 
        };
        
        return {
            id: foodId,
            name: foodId.replace('_', ' '),
            servings: servings,
            calories: baseNutrition.calories * servings,
            protein: baseNutrition.protein * servings,
            carbs: baseNutrition.carbs * servings,
            fat: baseNutrition.fat * servings,
            fiber: baseNutrition.fiber * servings,
            sugar: baseNutrition.sugar * servings,
            sodium: 0
        };
    }

    async logFood(foodId, foodName, servings = 1) {
        try {
            // Get nutrition data
            const nutritionData = await this.getFoodNutrition(foodId, servings);
            
            if (!nutritionData) {
                throw new Error('Could not get nutrition data');
            }
            
            // Add to current intake
            this.currentIntake.calories += nutritionData.calories;
            this.currentIntake.protein += nutritionData.protein;
            this.currentIntake.carbs += nutritionData.carbs;
            this.currentIntake.fat += nutritionData.fat;
            this.currentIntake.fiber += nutritionData.fiber;
            this.currentIntake.sugar += nutritionData.sugar;
            
            // Add to history
            const logEntry = {
                ...nutritionData,
                timestamp: new Date(),
                date: new Date().toISOString().split('T')[0]
            };
            
            this.mealHistory.push(logEntry);
            
            // Save to Firebase
            if (window.firebaseManager && currentUser) {
                await firebaseManager.logNutrition(logEntry);
            }
            
            // Update displays
            this.updateNutritionDisplays();
            
            // Generate insights
            const insights = this.generateMealInsights(logEntry);
            
            return {
                success: true,
                data: logEntry,
                insights: insights
            };
            
        } catch (error) {
            console.error('Error logging food:', error);
            throw error;
        }
    }

    generateMealInsights(mealData) {
        const insights = [];
        
        // Protein analysis
        const proteinRatio = (mealData.protein / mealData.calories) * 100;
        if (proteinRatio > 25) {
            insights.push({
                type: 'positive',
                message: 'Excellent protein content! This will help with muscle maintenance and satiety.'
            });
        } else if (proteinRatio < 10) {
            insights.push({
                type: 'suggestion',
                message: 'Consider adding more protein to this meal for better balance.'
            });
        }
        
        // Fiber analysis
        if (mealData.fiber > 8) {
            insights.push({
                type: 'positive',
                message: 'Great fiber intake! This supports digestive health and helps you feel full.'
            });
        } else if (mealData.fiber < 3) {
            insights.push({
                type: 'suggestion',
                message: 'Try adding vegetables or whole grains to increase fiber content.'
            });
        }
        
        // Sugar analysis
        if (mealData.sugar > 20) {
            insights.push({
                type: 'warning',
                message: 'High sugar content. Consider reducing added sugars when possible.'
            });
        }
        
        // Daily progress insights
        const progressInsights = this.analyzeDailyProgress();
        insights.push(...progressInsights);
        
        return insights;
    }

    analyzeDailyProgress() {
        const insights = [];
        const calorieProgress = (this.currentIntake.calories / this.dailyGoals.calories) * 100;
        const proteinProgress = (this.currentIntake.protein / this.dailyGoals.protein) * 100;
        
        if (calorieProgress > 90 && proteinProgress < 70) {
            insights.push({
                type: 'suggestion',
                message: 'You\'re close to your calorie goal but low on protein. Focus on lean proteins for remaining meals.'
            });
        }
        
        if (calorieProgress < 50 && new Date().getHours() > 18) {
            insights.push({
                type: 'warning',
                message: 'You may be under-eating today. Make sure to get adequate nutrition.'
            });
        }
        
        if (proteinProgress > 100) {
            insights.push({
                type: 'positive',
                message: 'Great job hitting your protein goal!'
            });
        }
        
        return insights;
    }

    calculatePersonalizedGoals(userProfile) {
        const { weight, height, age, gender, activityLevel, goal } = userProfile;
        
        // Calculate BMR using Mifflin-St Jeor Equation
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
        
        // Adjust based on goal
        let targetCalories = tdee;
        if (goal === 'lose') targetCalories *= 0.85;
        else if (goal === 'gain') targetCalories *= 1.15;
        
        // Calculate macronutrient goals
        const newGoals = {
            calories: Math.round(targetCalories),
            protein: Math.round(weight * 2.2), // 2.2g per kg body weight
            carbs: Math.round(targetCalories * 0.45 / 4), // 45% of calories
            fat: Math.round(targetCalories * 0.25 / 9), // 25% of calories
            fiber: Math.round(targetCalories / 1000 * 14), // 14g per 1000 calories
            sugar: Math.round(targetCalories * 0.1 / 4) // 10% of calories
        };
        
        this.dailyGoals = newGoals;
        
        // Save to user preferences
        if (window.firebaseManager && currentUser) {
            firebaseManager.updateUserPreferences({
                dailyCalories: newGoals.calories,
                dailyProtein: newGoals.protein,
                dailyCarbs: newGoals.carbs,
                dailyFat: newGoals.fat
            });
        }
        
        return newGoals;
    }

    async getWeeklyNutritionTrends() {
        try {
            if (!window.firebaseManager || !currentUser) {
                return null;
            }
            
            const logs = await firebaseManager.getNutritionLogs(7);
            
            // Group by day
            const dailyTotals = {};
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Initialize with zeros
            days.forEach(day => {
                dailyTotals[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            });
            
            logs.forEach(log => {
                if (log.timestamp) {
                    const dayName = days[log.timestamp.getDay()];
                    dailyTotals[dayName].calories += log.calories || 0;
                    dailyTotals[dayName].protein += log.protein || 0;
                    dailyTotals[dayName].carbs += log.carbs || 0;
                    dailyTotals[dayName].fat += log.fat || 0;
                }
            });
            
            return {
                calories: days.map(day => Math.round(dailyTotals[day].calories)),
                protein: days.map(day => Math.round(dailyTotals[day].protein)),
                carbs: days.map(day => Math.round(dailyTotals[day].carbs)),
                fat: days.map(day => Math.round(dailyTotals[day].fat))
            };
        } catch (error) {
            console.error('Error getting weekly trends:', error);
            return null;
        }
    }

    getMealRecommendations(mealType = 'any') {
        const currentDeficits = this.calculateNutritionalDeficits();
        const timeOfDay = new Date().getHours();
        
        let recommendations = [];
        
        if (currentDeficits.protein > 30) {
            recommendations.push({
                type: 'protein',
                message: 'Add protein-rich foods like chicken breast, fish, eggs, or legumes',
                foods: ['chicken breast', 'salmon', 'eggs', 'greek yogurt', 'tofu']
            });
        }
        
        if (currentDeficits.fiber > 15) {
            recommendations.push({
                type: 'fiber',
                message: 'Increase fiber with vegetables, fruits, or whole grains',
                foods: ['broccoli', 'spinach', 'quinoa', 'oats', 'berries']
            });
        }
        
        if (currentDeficits.calories > 800) {
            recommendations.push({
                type: 'energy',
                message: 'You need more calories to meet your daily goal',
                foods: ['nuts', 'avocado', 'olive oil', 'whole grains']
            });
        }
        
        // Time-based recommendations
        if (timeOfDay < 11) {
            recommendations.push({
                type: 'timing',
                message: 'Great time for a protein and fiber-rich breakfast',
                foods: ['oats', 'eggs', 'greek yogurt', 'berries']
            });
        } else if (timeOfDay > 18) {
            recommendations.push({
                type: 'timing',
                message: 'Evening meals should be lighter and protein-focused',
                foods: ['salmon', 'vegetables', 'salad', 'lean protein']
            });
        }
        
        return recommendations;
    }

    calculateNutritionalDeficits() {
        return {
            calories: Math.max(0, this.dailyGoals.calories - this.currentIntake.calories),
            protein: Math.max(0, this.dailyGoals.protein - this.currentIntake.protein),
            carbs: Math.max(0, this.dailyGoals.carbs - this.currentIntake.carbs),
            fat: Math.max(0, this.dailyGoals.fat - this.currentIntake.fat),
            fiber: Math.max(0, this.dailyGoals.fiber - this.currentIntake.fiber)
        };
    }

    updateNutritionDisplays() {
        // Update progress bars and text
        this.updateProgressDisplay('calorie', this.currentIntake.calories, this.dailyGoals.calories);
        this.updateProgressDisplay('protein', this.currentIntake.protein, this.dailyGoals.protein);
        this.updateProgressDisplay('carb', this.currentIntake.carbs, this.dailyGoals.carbs);
    }

    updateProgressDisplay(type, current, goal) {
        const progressElement = document.getElementById(`${type}Progress`);
        const barElement = document.getElementById(`${type}Bar`);
        
        if (progressElement) {
            const unit = type === 'calorie' ? '' : 'g';
            progressElement.textContent = `${Math.round(current)}${unit} / ${goal}${unit}`;
        }
        
        if (barElement) {
            const percentage = Math.min(100, (current / goal) * 100);
            barElement.style.width = `${percentage}%`;
            
            // Update color based on progress
            const baseClass = barElement.className.split(' ')[0];
            barElement.className = `${baseClass} ${
                percentage >= 90 ? 'bg-success' : 
                percentage >= 70 ? 'bg-warning' : 'bg-danger'
            }`;
        }
    }

    // Reset daily tracking (call at midnight)
    resetDaily() {
        this.currentIntake = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
        };
        this.mealHistory = [];
        this.updateNutritionDisplays();
    }

    // Get nutrition summary for reports
    getNutritionSummary() {
        return {
            current: this.currentIntake,
            goals: this.dailyGoals,
            history: this.mealHistory,
            progress: {
                calories: (this.currentIntake.calories / this.dailyGoals.calories) * 100,
                protein: (this.currentIntake.protein / this.dailyGoals.protein) * 100,
                carbs: (this.currentIntake.carbs / this.dailyGoals.carbs) * 100,
                fat: (this.currentIntake.fat / this.dailyGoals.fat) * 100
            },
            deficits: this.calculateNutritionalDeficits(),
            recommendations: this.getMealRecommendations()
        };
    }

    // Cleanup listeners
    cleanup() {
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners = [];
    }
}

// Initialize nutrition tracker
const nutritionTracker = new NutritionTracker();

// Export for global use
window.nutritionTracker = nutritionTracker;

// Set up automatic midnight reset
const checkMidnight = () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        nutritionTracker.resetDaily();
    }
};

// Check every minute for midnight
setInterval(checkMidnight, 60000);

console.log('Nutrition tracker loaded');