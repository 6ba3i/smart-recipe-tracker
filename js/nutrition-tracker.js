// Nutrition Tracker with AI Insights
class NutritionTracker {
    constructor() {
        this.dailyLogs = [];
        this.nutritionGoals = {
            calories: 2000,
            protein: 150,
            carbs: 225,
            fat: 67,
            fiber: 25,
            sugar: 50
        };
        this.foodDatabase = this.loadFoodDatabase();
        this.aiInsights = {
            trends: [],
            predictions: [],
            recommendations: []
        };
        
        this.initializeTracker();
    }

    initializeTracker() {
        this.loadUserGoals();
        this.loadTodaysLogs();
        this.setupFoodSearch();
        this.setupEventListeners();
        console.log('Nutrition Tracker initialized');
    }

    async loadUserGoals() {
        try {
            if (window.firebaseConfig?.helper) {
                const saved = await window.firebaseConfig.helper.getUserData('nutritionGoals');
                if (saved) {
                    this.nutritionGoals = { ...this.nutritionGoals, ...saved };
                }
            }
        } catch (error) {
            console.error('Error loading nutrition goals:', error);
        }
    }

    async loadTodaysLogs() {
        try {
            if (window.firebaseConfig?.helper) {
                const logs = await window.firebaseConfig.helper.getUserDocuments('nutritionLogs');
                const today = new Date().toISOString().split('T')[0];
                this.dailyLogs = logs.filter(log => log.date === today) || [];
                this.updateNutritionDisplay();
            }
        } catch (error) {
            console.error('Error loading nutrition logs:', error);
        }
    }

    loadFoodDatabase() {
        return [
            {
                id: 1,
                name: "Chicken Breast (100g)",
                calories: 165,
                protein: 31,
                carbs: 0,
                fat: 3.6,
                fiber: 0,
                sugar: 0,
                category: "protein",
                searchTerms: ["chicken", "breast", "poultry"]
            },
            {
                id: 2,
                name: "Brown Rice (1 cup cooked)",
                calories: 216,
                protein: 5,
                carbs: 45,
                fat: 1.8,
                fiber: 4,
                sugar: 0,
                category: "carbs",
                searchTerms: ["rice", "brown rice", "grain"]
            },
            {
                id: 3,
                name: "Broccoli (1 cup)",
                calories: 25,
                protein: 3,
                carbs: 5,
                fat: 0.3,
                fiber: 2.3,
                sugar: 1.5,
                category: "vegetables",
                searchTerms: ["broccoli", "vegetable", "green"]
            },
            {
                id: 4,
                name: "Salmon (100g)",
                calories: 208,
                protein: 25,
                carbs: 0,
                fat: 12,
                fiber: 0,
                sugar: 0,
                category: "protein",
                searchTerms: ["salmon", "fish", "omega"]
            },
            {
                id: 5,
                name: "Greek Yogurt (1 cup)",
                calories: 130,
                protein: 23,
                carbs: 9,
                fat: 0,
                fiber: 0,
                sugar: 9,
                category: "dairy",
                searchTerms: ["yogurt", "greek", "dairy"]
            },
            {
                id: 6,
                name: "Avocado (1 medium)",
                calories: 234,
                protein: 3,
                carbs: 12,
                fat: 21,
                fiber: 10,
                sugar: 1,
                category: "healthy fats",
                searchTerms: ["avocado", "healthy fat"]
            },
            {
                id: 7,
                name: "Quinoa (1 cup cooked)",
                calories: 222,
                protein: 8,
                carbs: 39,
                fat: 4,
                fiber: 5,
                sugar: 2,
                category: "carbs",
                searchTerms: ["quinoa", "grain", "protein"]
            },
            {
                id: 8,
                name: "Almonds (1 oz)",
                calories: 161,
                protein: 6,
                carbs: 6,
                fat: 14,
                fiber: 4,
                sugar: 1,
                category: "nuts",
                searchTerms: ["almonds", "nuts", "snack"]
            },
            {
                id: 9,
                name: "Sweet Potato (1 medium)",
                calories: 112,
                protein: 2,
                carbs: 26,
                fat: 0.1,
                fiber: 4,
                sugar: 5,
                category: "carbs",
                searchTerms: ["sweet potato", "potato", "carbs"]
            },
            {
                id: 10,
                name: "Spinach (1 cup)",
                calories: 7,
                protein: 1,
                carbs: 1,
                fat: 0.1,
                fiber: 0.7,
                sugar: 0.1,
                category: "vegetables",
                searchTerms: ["spinach", "leafy", "green"]
            },
            {
                id: 11,
                name: "Egg (1 large)",
                calories: 70,
                protein: 6,
                carbs: 0.6,
                fat: 5,
                fiber: 0,
                sugar: 0.6,
                category: "protein",
                searchTerms: ["egg", "protein", "breakfast"]
            },
            {
                id: 12,
                name: "Banana (1 medium)",
                calories: 105,
                protein: 1.3,
                carbs: 27,
                fat: 0.4,
                fiber: 3,
                sugar: 14,
                category: "fruits",
                searchTerms: ["banana", "fruit", "potassium"]
            }
        ];
    }

    setupFoodSearch() {
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            // Create autocomplete dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'food-search-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                max-height: 200px;
                overflow-y: auto;
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                z-index: 1000;
                display: none;
            `;
            
            searchInput.parentNode.style.position = 'relative';
            searchInput.parentNode.appendChild(dropdown);
            
            searchInput.addEventListener('input', (e) => {
                this.handleFoodSearch(e.target.value, dropdown);
            });
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => dropdown.style.display = 'none', 200);
            });
        }
    }

    handleFoodSearch(query, dropdown) {
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }

        const results = this.searchFood(query);
        this.displaySearchResults(results, dropdown);
    }

    searchFood(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.foodDatabase.filter(food => 
            food.name.toLowerCase().includes(lowercaseQuery) ||
            food.searchTerms.some(term => term.includes(lowercaseQuery))
        ).slice(0, 5);
    }

    displaySearchResults(results, dropdown) {
        if (results.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = results.map(food => `
            <div class="food-search-item" 
                 style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid var(--border-color);"
                 onclick="nutritionTracker.selectFood(${food.id})">
                <div style="font-weight: 600; color: var(--text-primary);">${food.name}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    ${food.calories} cal | ${food.protein}g protein | ${food.carbs}g carbs
                </div>
            </div>
        `).join('');

        dropdown.style.display = 'block';
    }

    selectFood(foodId) {
        const food = this.foodDatabase.find(f => f.id === foodId);
        if (food) {
            document.getElementById('foodSearch').value = food.name;
            document.querySelector('.food-search-dropdown').style.display = 'none';
            
            // Pre-fill nutrition values
            this.fillNutritionForm(food);
        }
    }

    fillNutritionForm(food) {
        const fields = ['calories', 'protein', 'carbs', 'fat'];
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.value = food[field] || 0;
            }
        });
    }

    setupEventListeners() {
        // Quick log buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-log-btn')) {
                const foodId = parseInt(e.target.dataset.foodId);
                this.quickLogFood(foodId);
            }
        });

        // Goal adjustment
        const goalInputs = document.querySelectorAll('.goal-input');
        goalInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateGoals();
            });
        });
    }

    async logFood(foodData) {
        try {
            const logEntry = {
                ...foodData,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                meal: foodData.meal || 'snack'
            };

            // Save to Firebase
            if (window.firebaseConfig?.helper) {
                await window.firebaseConfig.helper.addDocument('nutritionLogs', logEntry);
            }

            // Add to local logs
            this.dailyLogs.push(logEntry);
            
            // Update display
            this.updateNutritionDisplay();
            this.generateAIInsights();
            
            return true;
        } catch (error) {
            console.error('Error logging food:', error);
            throw error;
        }
    }

    async quickLogFood(foodId) {
        const food = this.foodDatabase.find(f => f.id === foodId);
        if (food) {
            const portion = prompt(`How many servings of ${food.name}?`, '1');
            if (portion && !isNaN(portion)) {
                const multiplier = parseFloat(portion);
                const logData = {
                    food: food.name,
                    calories: Math.round(food.calories * multiplier),
                    protein: Math.round(food.protein * multiplier * 10) / 10,
                    carbs: Math.round(food.carbs * multiplier * 10) / 10,
                    fat: Math.round(food.fat * multiplier * 10) / 10,
                    fiber: Math.round((food.fiber || 0) * multiplier * 10) / 10,
                    sugar: Math.round((food.sugar || 0) * multiplier * 10) / 10,
                    servings: multiplier
                };
                
                await this.logFood(logData);
                this.showSuccess(`Logged ${portion} serving(s) of ${food.name}`);
            }
        }
    }

    updateNutritionDisplay() {
        const totals = this.calculateDailyTotals();
        
        // Update progress bars and numbers
        this.updateProgressBar('calories', totals.calories, this.nutritionGoals.calories);
        this.updateProgressBar('protein', totals.protein, this.nutritionGoals.protein);
        this.updateProgressBar('carbs', totals.carbs, this.nutritionGoals.carbs);
        this.updateProgressBar('fat', totals.fat, this.nutritionGoals.fat);

        // Update chart if available
        if (window.chartManager) {
            window.chartManager.createNutritionChart('dailyNutritionChart', {
                title: "Today's Nutrition",
                protein: totals.protein,
                carbs: totals.carbs,
                fat: totals.fat
            });
        }

        // Update recent logs
        this.updateRecentLogs();
    }

    calculateDailyTotals() {
        return this.dailyLogs.reduce((totals, log) => {
            totals.calories += log.calories || 0;
            totals.protein += log.protein || 0;
            totals.carbs += log.carbs || 0;
            totals.fat += log.fat || 0;
            totals.fiber += log.fiber || 0;
            totals.sugar += log.sugar || 0;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });
    }

    updateProgressBar(nutrient, current, goal) {
        const progressBar = document.querySelector(`[data-nutrient="${nutrient}"] .progress-bar`);
        const progressText = document.querySelector(`[data-nutrient="${nutrient}"] .progress-text`);
        
        if (progressBar && progressText) {
            const percentage = Math.min((current / goal) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(current)}/${goal}`;
            
            // Color coding
            if (percentage >= 90) {
                progressBar.className = 'progress-bar bg-success';
            } else if (percentage >= 70) {
                progressBar.className = 'progress-bar bg-warning';
            } else {
                progressBar.className = 'progress-bar bg-danger';
            }
        }
    }

    updateRecentLogs() {
        const container = document.getElementById('recentLogs');
        if (!container) return;

        const recentLogs = this.dailyLogs.slice(-5).reverse();
        
        container.innerHTML = recentLogs.map(log => `
            <div class="log-item d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <div class="fw-semibold">${log.food}</div>
                    <small class="text-muted">${new Date(log.timestamp).toLocaleTimeString()}</small>
                </div>
                <div class="text-end">
                    <div class="fw-semibold">${log.calories} cal</div>
                    <small class="text-muted">${log.protein}g protein</small>
                </div>
            </div>
        `).join('');
    }

    async updateGoals() {
        try {
            const newGoals = {
                calories: parseInt(document.getElementById('calorieGoal')?.value) || this.nutritionGoals.calories,
                protein: parseInt(document.getElementById('proteinGoal')?.value) || this.nutritionGoals.protein,
                carbs: parseInt(document.getElementById('carbGoal')?.value) || this.nutritionGoals.carbs,
                fat: parseInt(document.getElementById('fatGoal')?.value) || this.nutritionGoals.fat
            };

            this.nutritionGoals = { ...this.nutritionGoals, ...newGoals };

            // Save to Firebase
            if (window.firebaseConfig?.helper) {
                await window.firebaseConfig.helper.saveUserData('nutritionGoals', this.nutritionGoals);
            }

            this.updateNutritionDisplay();
            this.showSuccess('Nutrition goals updated!');
        } catch (error) {
            console.error('Error updating goals:', error);
            this.showError('Failed to update goals');
        }
    }

    generateAIInsights() {
        const totals = this.calculateDailyTotals();
        const insights = [];

        // Calorie analysis
        const caloriePercent = (totals.calories / this.nutritionGoals.calories) * 100;
        if (caloriePercent < 80) {
            insights.push({
                type: 'warning',
                message: `You're ${Math.round(this.nutritionGoals.calories - totals.calories)} calories below your goal. Consider adding a healthy snack.`,
                recommendation: 'Try nuts, Greek yogurt, or a protein smoothie'
            });
        } else if (caloriePercent > 110) {
            insights.push({
                type: 'info',
                message: `You're ${Math.round(totals.calories - this.nutritionGoals.calories)} calories over your goal.`,
                recommendation: 'Focus on lighter meals tomorrow or add some exercise'
            });
        }

        // Protein analysis
        const proteinPercent = (totals.protein / this.nutritionGoals.protein) * 100;
        if (proteinPercent < 80) {
            insights.push({
                type: 'warning',
                message: `Protein intake is low. You need ${Math.round(this.nutritionGoals.protein - totals.protein)}g more.`,
                recommendation: 'Add lean meats, eggs, or protein powder to your next meal'
            });
        }

        // Macro balance analysis
        const proteinCals = totals.protein * 4;
        const carbCals = totals.carbs * 4;
        const fatCals = totals.fat * 9;
        const totalMacroCals = proteinCals + carbCals + fatCals;

        if (totalMacroCals > 0) {
            const proteinRatio = (proteinCals / totalMacroCals) * 100;
            const carbRatio = (carbCals / totalMacroCals) * 100;
            const fatRatio = (fatCals / totalMacroCals) * 100;

            if (proteinRatio > 35) {
                insights.push({
                    type: 'info',
                    message: 'High protein ratio detected. Great for muscle building!',
                    recommendation: 'Make sure to stay hydrated with increased protein intake'
                });
            }

            if (carbRatio < 25) {
                insights.push({
                    type: 'info',
                    message: 'Low carbohydrate intake. You might be following a low-carb diet.',
                    recommendation: 'Ensure adequate energy for workouts'
                });
            }
        }

        // Time-based insights
        const currentHour = new Date().getHours();
        if (currentHour > 18 && totals.calories < this.nutritionGoals.calories * 0.7) {
            insights.push({
                type: 'warning',
                message: 'Evening calorie intake seems low. Consider a balanced dinner.',
                recommendation: 'Include protein, healthy carbs, and vegetables'
            });
        }

        this.aiInsights.recommendations = insights;
        this.displayAIInsights();
    }

    displayAIInsights() {
        const container = document.getElementById('aiInsights');
        if (!container) return;

        const insights = this.aiInsights.recommendations;
        
        if (insights.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    Your nutrition is looking great today! Keep it up!
                </div>
            `;
            return;
        }

        container.innerHTML = insights.map(insight => `
            <div class="alert alert-${insight.type === 'warning' ? 'warning' : 'info'} mb-3">
                <div class="d-flex align-items-start">
                    <i class="fas fa-${insight.type === 'warning' ? 'exclamation-triangle' : 'lightbulb'} me-2 mt-1"></i>
                    <div>
                        <div class="fw-semibold mb-1">${insight.message}</div>
                        <small class="text-muted">${insight.recommendation}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getWeeklyAnalysis() {
        // This would analyze the past week's nutrition data
        return {
            averageCalories: 1950,
            averageProtein: 145,
            trends: {
                calories: 'stable',
                protein: 'increasing',
                carbs: 'decreasing'
            },
            recommendations: [
                'Your protein intake has been consistently good',
                'Consider increasing vegetables for more micronutrients',
                'Hydration tracking could be beneficial'
            ]
        };
    }

    exportNutritionData() {
        const data = {
            goals: this.nutritionGoals,
            dailyLogs: this.dailyLogs,
            insights: this.aiInsights,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        // Create toast notification
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

// Initialize nutrition tracker
const nutritionTracker = new NutritionTracker();

// Export for global use
window.nutritionTracker = nutritionTracker;

console.log('Nutrition Tracker loaded successfully');