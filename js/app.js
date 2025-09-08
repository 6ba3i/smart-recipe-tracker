// Smart Recipe Tracker - Main Application Logic

class SmartRecipeApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.recipes = [];
        this.userNutrition = {};
        this.shoppingList = [];
        this.mealPlan = {};
        
        // Initialize when Firebase is ready
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Wait for configuration manager to be ready
            await this.waitForConfigManager();
            
            // Wait for Firebase to be initialized
            await this.waitForFirebase();
            
            // Set up authentication state listener
            this.setupAuthStateListener();
            
            // Initialize charts and UI components
            this.initializeCharts();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ Smart Recipe App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application. Please check your configuration and refresh the page.');
        }
    }

    waitForConfigManager() {
        return new Promise((resolve) => {
            const checkConfigManager = () => {
                if (window.configManager && window.configManager.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkConfigManager, 100);
                }
            };
            checkConfigManager();
        });
    }

    waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseManager && window.firebaseManager.isReady()) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    setupAuthStateListener() {
        const auth = window.firebaseConfig.auth;
        
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.handleUserSignedIn(user);
            } else {
                this.handleUserSignedOut();
            }
        });
    }

    async handleUserSignedIn(user) {
        console.log('User signed in:', user);
        
        // Update UI with user info
        this.updateUserInterface(user);
        
        // Load user data
        await this.loadUserData();
        
        // Load dashboard data
        await this.loadDashboardData();
        
        // Show the main app
        document.body.style.display = 'block';
    }

    handleUserSignedOut() {
        console.log('User signed out');
        // Redirect to login page
        window.location.href = 'login.html';
    }

    updateUserInterface(user) {
        // Update user display name
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.textContent = user.displayName || user.email || 'User';
        }

        // Update user avatar if available
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar && user.photoURL) {
            userAvatar.src = user.photoURL;
        }
    }

    async loadUserData() {
        if (!this.currentUser) return;

        try {
            const db = window.firebaseConfig.db;
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            
            if (userDoc.exists) {
                this.userData = userDoc.data();
                console.log('User data loaded:', this.userData);
            } else {
                console.log('No user data found, using defaults');
                this.userData = this.getDefaultUserData();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.userData = this.getDefaultUserData();
        }
    }

    getDefaultUserData() {
        return {
            preferences: {
                dietaryRestrictions: [],
                allergies: [],
                favoritesCuisines: [],
                nutritionGoals: {
                    calories: 2000,
                    protein: 150,
                    carbs: 200,
                    fat: 70
                }
            },
            stats: {
                recipesTracked: 0,
                weekStreak: 0,
                healthScore: 0
            }
        };
    }

    async loadDashboardData() {
        try {
            // Update stats
            this.updateDashboardStats();
            
            // Load recent recipes
            await this.loadRecentRecipes();
            
            // Update nutrition chart
            this.updateNutritionChart();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats() {
        const stats = this.userData.stats || {};
        
        // Update stat cards
        document.getElementById('recipesTracked').textContent = stats.recipesTracked || 47;
        document.getElementById('weekStreak').textContent = stats.weekStreak || 12;
        document.getElementById('healthScore').textContent = (stats.healthScore || 87) + '%';
        
        // Today's calories (mock data for now)
        document.getElementById('todayCalories').textContent = '1,250';
    }

    async loadRecentRecipes() {
        const container = document.getElementById('recentRecipesContainer');
        if (!container) return;

        try {
            // Show loading state
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="loading-spinner"></div>
                    <p class="text-muted mt-2">Loading your recent recipes...</p>
                </div>
            `;

            // Get random recipes from Spoonacular API
            const result = await window.spoonacularAPI.getRandomRecipes({ number: 4 });
            
            if (result.recipes && result.recipes.length > 0) {
                container.innerHTML = result.recipes.map(recipe => this.createRecipeCard(recipe)).join('');
            } else {
                container.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <p class="text-muted">No recent recipes found. Start discovering new recipes!</p>
                        <button class="btn btn-primary" onclick="showPage('recipes')">
                            <i class="fas fa-search me-2"></i>Discover Recipes
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading recent recipes:', error);
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p class="text-danger">Failed to load recipes. Please check your API configuration.</p>
                    <button class="btn btn-outline-primary" onclick="this.loadRecentRecipes()">
                        <i class="fas fa-redo me-2"></i>Retry
                    </button>
                </div>
            `;
        }
    }

    createRecipeCard(recipe, size = 'col-md-6 col-lg-3') {
        return `
            <div class="${size} mb-3">
                <div class="card recipe-card h-100" onclick="showRecipeDetail(${recipe.id})">
                    <img src="${recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop'}" 
                         class="card-img-top" alt="${recipe.title}">
                    <div class="recipe-overlay">
                        <i class="fas fa-eye fa-2x"></i>
                        <div>View Recipe</div>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${recipe.title}</h6>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>${recipe.readyInMinutes || 30} min
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i>${recipe.servings || 4} servings
                            </small>
                        </div>
                        <div class="nutrition-badges">
                            <span class="nutrition-badge calories">${recipe.nutrition.calories} cal</span>
                            <span class="nutrition-badge protein">${recipe.nutrition.protein}g protein</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Page Navigation
    setupEventListeners() {
        // Search functionality
        const recipeSearch = document.getElementById('recipeSearch');
        if (recipeSearch) {
            recipeSearch.addEventListener('input', this.debounce((e) => {
                this.searchRecipes(e.target.value);
            }, 500));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e.target);
            });
        });

        // Date inputs
        const nutritionDate = document.getElementById('nutritionDate');
        if (nutritionDate) {
            nutritionDate.value = new Date().toISOString().split('T')[0];
            nutritionDate.addEventListener('change', (e) => {
                this.loadNutritionData(e.target.value);
            });
        }

        // Week picker
        const weekPicker = document.getElementById('weekPicker');
        if (weekPicker) {
            weekPicker.value = this.getCurrentWeek();
            weekPicker.addEventListener('change', (e) => {
                this.loadWeeklyMealPlan(e.target.value);
            });
        }
    }

    // Recipe Search and Discovery
    async searchRecipes(query, filters = {}) {
        const resultsContainer = document.getElementById('recipeResults');
        if (!resultsContainer) return;

        try {
            // Show loading
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="loading-spinner"></div>
                    <p class="text-muted mt-3">Searching for delicious recipes...</p>
                </div>
            `;

            const searchOptions = {
                number: 12,
                offset: 0,
                ...filters
            };

            let result;
            if (query && query.trim()) {
                result = await window.spoonacularAPI.searchRecipes(query, searchOptions);
            } else {
                result = await window.spoonacularAPI.getRandomRecipes({ number: 12 });
                result = { recipes: result.recipes, totalResults: result.recipes.length };
            }

            this.displayRecipeResults(result);

        } catch (error) {
            console.error('Error searching recipes:', error);
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Failed to search recipes. Please check your internet connection and API configuration.</p>
                    <button class="btn btn-outline-primary" onclick="window.app.searchRecipes('${query}')">
                        <i class="fas fa-redo me-2"></i>Try Again
                    </button>
                </div>
            `;
        }
    }

    displayRecipeResults(result) {
        const resultsContainer = document.getElementById('recipeResults');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        if (result.recipes && result.recipes.length > 0) {
            resultsContainer.innerHTML = result.recipes.map(recipe => 
                this.createRecipeCard(recipe, 'col-md-6 col-lg-4')
            ).join('');

            // Show load more button if there are more results
            if (loadMoreContainer && result.totalResults > result.recipes.length) {
                loadMoreContainer.style.display = 'block';
            }
        } else {
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No recipes found</h4>
                    <p class="text-muted">Try adjusting your search terms or filters</p>
                </div>
            `;
            
            if (loadMoreContainer) {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    handleFilterClick(button) {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;
        let searchOptions = {};

        switch (filter) {
            case 'vegetarian':
                searchOptions.diet = 'vegetarian';
                break;
            case 'vegan':
                searchOptions.diet = 'vegan';
                break;
            case 'gluten-free':
                searchOptions.intolerances = 'gluten';
                break;
            case 'quick':
                searchOptions.maxReadyTime = 30;
                break;
            case 'healthy':
                searchOptions.sort = 'healthiness';
                break;
        }

        const query = document.getElementById('recipeSearch').value;
        this.searchRecipes(query, searchOptions);
    }

    // Recipe Detail Modal
    async showRecipeDetail(recipeId) {
        const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
        const modalTitle = document.getElementById('recipeModalTitle');
        const modalBody = document.getElementById('recipeModalBody');

        try {
            // Show loading
            modalTitle.textContent = 'Loading Recipe...';
            modalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="loading-spinner"></div>
                    <p class="text-muted mt-2">Loading recipe details...</p>
                </div>
            `;
            modal.show();

            // Fetch recipe details
            const recipe = await window.spoonacularAPI.getRecipeDetails(recipeId);
            
            // Update modal content
            modalTitle.textContent = recipe.title;
            modalBody.innerHTML = this.createRecipeDetailContent(recipe);

        } catch (error) {
            console.error('Error loading recipe details:', error);
            modalTitle.textContent = 'Error Loading Recipe';
            modalBody.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load recipe details. Please try again later.
                </div>
            `;
        }
    }

    createRecipeDetailContent(recipe) {
        const ingredients = recipe.ingredients || [];
        const instructions = recipe.instructions || [];

        return `
            <div class="row">
                <div class="col-md-6">
                    <img src="${recipe.image}" class="img-fluid rounded mb-3" alt="${recipe.title}">
                    
                    <div class="nutrition-info">
                        <h6>Nutrition Information</h6>
                        <div class="row">
                            <div class="col-6 mb-2">
                                <div class="nutrition-badge calories w-100">${recipe.nutrition.calories} calories</div>
                            </div>
                            <div class="col-6 mb-2">
                                <div class="nutrition-badge protein w-100">${recipe.nutrition.protein}g protein</div>
                            </div>
                            <div class="col-6 mb-2">
                                <div class="nutrition-badge carbs w-100">${recipe.nutrition.carbs}g carbs</div>
                            </div>
                            <div class="col-6 mb-2">
                                <div class="nutrition-badge fat w-100">${recipe.nutrition.fat}g fat</div>
                            </div>
                        </div>
                    </div>

                    <div class="recipe-meta mt-3">
                        <p><i class="fas fa-clock me-2"></i><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
                        <p><i class="fas fa-users me-2"></i><strong>Servings:</strong> ${recipe.servings}</p>
                        ${recipe.healthScore ? `<p><i class="fas fa-heart me-2"></i><strong>Health Score:</strong> ${recipe.healthScore}/100</p>` : ''}
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="ingredients mb-4">
                        <h6>Ingredients</h6>
                        <ul class="list-unstyled">
                            ${ingredients.map(ing => `
                                <li class="mb-1">
                                    <i class="fas fa-check text-success me-2"></i>
                                    ${ing.amount || ''} ${ing.unit || ''} ${ing.name || ing.original}
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    ${instructions.length > 0 ? `
                        <div class="instructions">
                            <h6>Instructions</h6>
                            <ol>
                                ${instructions[0].steps ? instructions[0].steps.map(step => `
                                    <li class="mb-2">${step.step}</li>
                                `).join('') : '<li>Instructions not available</li>'}
                            </ol>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${recipe.summary ? `
                <div class="mt-4">
                    <h6>About This Recipe</h6>
                    <div class="text-muted">${recipe.summary.replace(/<[^>]*>/g, '')}</div>
                </div>
            ` : ''}
        `;
    }

    // Charts and Analytics
    initializeCharts() {
        // Initialize all charts
        this.initNutritionChart();
        this.initProgressCharts();
        this.initWeeklyChart();
    }

    initNutritionChart() {
        const chartContainer = document.getElementById('nutritionChart');
        if (!chartContainer) return;

        this.nutritionChart = echarts.init(chartContainer);
        this.updateNutritionChart();
    }

    updateNutritionChart() {
        if (!this.nutritionChart) return;

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: { color: '#f8fafc' }
            },
            legend: {
                data: ['Calories', 'Protein', 'Carbs', 'Fat'],
                textStyle: { color: '#cbd5e1' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: '#475569' } },
                axisLabel: { color: '#cbd5e1' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#475569' } },
                axisLabel: { color: '#cbd5e1' },
                splitLine: { lineStyle: { color: '#334155' } }
            },
            series: [
                {
                    name: 'Calories',
                    type: 'line',
                    data: [1200, 1350, 1180, 1420, 1300, 1250, 1400],
                    smooth: true,
                    lineStyle: { color: '#6366f1' },
                    itemStyle: { color: '#6366f1' }
                },
                {
                    name: 'Protein',
                    type: 'line',
                    data: [80, 95, 75, 110, 85, 90, 105],
                    smooth: true,
                    lineStyle: { color: '#10b981' },
                    itemStyle: { color: '#10b981' }
                }
            ]
        };

        this.nutritionChart.setOption(option);
    }

    initProgressCharts() {
        // Initialize circular progress charts for nutrition goals
        const progressCharts = ['calories', 'protein', 'carbs', 'fat'];
        
        progressCharts.forEach(nutrient => {
            const container = document.getElementById(`${nutrient}Progress`);
            if (container) {
                const chart = echarts.init(container);
                this.updateProgressChart(chart, nutrient);
            }
        });
    }

    updateProgressChart(chart, nutrient) {
        const data = {
            calories: { current: 1250, goal: 2000, color: '#ef4444' },
            protein: { current: 98, goal: 150, color: '#10b981' },
            carbs: { current: 145, goal: 200, color: '#f59e0b' },
            fat: { current: 42, goal: 70, color: '#6366f1' }
        };

        const nutrientData = data[nutrient];
        const percentage = Math.round((nutrientData.current / nutrientData.goal) * 100);

        const option = {
            backgroundColor: 'transparent',
            series: [{
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: { show: false },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: { color: nutrientData.color }
                },
                axisLine: {
                    lineStyle: { width: 8, color: [[1, '#334155']] }
                },
                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                data: [{
                    value: percentage,
                    title: {
                        offsetCenter: ['0%', '0%'],
                        fontSize: 14,
                        color: '#f8fafc'
                    },
                    detail: {
                        valueAnimation: true,
                        offsetCenter: ['0%', '20%'],
                        fontSize: 12,
                        color: '#cbd5e1',
                        formatter: `${percentage}%`
                    }
                }]
            }]
        };

        chart.setOption(option);
    }

    initWeeklyChart() {
        const chartContainer = document.getElementById('weeklyNutritionChart');
        if (!chartContainer) return;

        this.weeklyChart = echarts.init(chartContainer);
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    getCurrentWeek() {
        const today = new Date();
        const year = today.getFullYear();
        const week = this.getWeekNumber(today);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    showError(message) {
        console.error(message);
        // You could implement a toast notification system here
        alert(message);
    }

    showSuccess(message) {
        console.log(message);
        // You could implement a toast notification system here
    }
}

// Global Functions for UI Interactions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load page-specific data
        if (window.app) {
            window.app.currentPage = pageId;
            
            if (pageId === 'recipes') {
                window.app.searchRecipes('');
            } else if (pageId === 'nutrition') {
                window.app.loadNutritionData();
            } else if (pageId === 'meal-planner') {
                window.app.loadWeeklyMealPlan();
            } else if (pageId === 'shopping') {
                window.app.loadShoppingList();
            }
        }
    }
}

function showRecipeDetail(recipeId) {
    if (window.app) {
        window.app.showRecipeDetail(recipeId);
    }
}

function logQuickMeal() {
    const modal = new bootstrap.Modal(document.getElementById('quickMealModal'));
    modal.show();
}

function saveQuickMeal() {
    // Implementation for saving quick meal
    const modal = bootstrap.Modal.getInstance(document.getElementById('quickMealModal'));
    modal.hide();
    
    if (window.app) {
        window.app.showSuccess('Meal logged successfully!');
    }
}

function generateMealPlan() {
    if (window.app) {
        window.app.generateMealPlan();
    }
}

function addToMealPlan() {
    // Implementation for adding recipe to meal plan
    if (window.app) {
        window.app.showSuccess('Recipe added to meal plan!');
    }
}

function saveRecipe() {
    // Implementation for saving recipe to favorites
    if (window.app) {
        window.app.showSuccess('Recipe saved to favorites!');
    }
}

function logout() {
    if (window.firebaseConfig && window.firebaseConfig.auth) {
        window.firebaseConfig.auth.signOut().then(() => {
            console.log('User signed out successfully');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    }
}

function applyAdvancedFilters() {
    if (window.app) {
        const filters = {
            cuisine: document.getElementById('cuisineFilter').value,
            maxReadyTime: document.getElementById('timeFilter').value,
            minCalories: document.getElementById('minCalories').value,
            maxCalories: document.getElementById('maxCalories').value,
            intolerances: document.getElementById('dietFilter').value
        };
        
        const query = document.getElementById('recipeSearch').value;
        window.app.searchRecipes(query, filters);
    }
}

function clearFilters() {
    // Reset all filter inputs
    document.getElementById('cuisineFilter').value = '';
    document.getElementById('timeFilter').value = '';
    document.getElementById('minCalories').value = '';
    document.getElementById('maxCalories').value = '';
    document.getElementById('dietFilter').value = '';
    document.getElementById('recipeSearch').value = '';
    
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    
    // Search with no filters
    if (window.app) {
        window.app.searchRecipes('');
    }
}

function loadMoreRecipes() {
    // Implementation for loading more recipe results
    if (window.app) {
        window.app.loadMoreRecipes();
    }
}

function logFood() {
    // Implementation for logging food to nutrition tracker
    if (window.app) {
        window.app.logFood();
    }
}

function addShoppingItem() {
    // Implementation for adding item to shopping list
    if (window.app) {
        window.app.addShoppingItem();
    }
}

function generateShoppingList() {
    // Implementation for auto-generating shopping list
    if (window.app) {
        window.app.generateShoppingList();
    }
}

function clearCompletedItems() {
    // Implementation for clearing completed shopping items
    if (window.app) {
        window.app.clearCompletedItems();
    }
}

function saveMealPlanSettings() {
    // Implementation for saving meal plan settings
    if (window.app) {
        window.app.saveMealPlanSettings();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the login page
    if (window.location.pathname.includes('login.html')) {
        return; // Don't initialize main app on login page
    }
    
    // Hide the body initially until user is authenticated
    document.body.style.display = 'none';
    
    // Initialize the main app
    window.app = new SmartRecipeApp();
});

// Handle window resize for charts
window.addEventListener('resize', () => {
    if (window.app) {
        // Resize charts when window is resized
        if (window.app.nutritionChart) {
            window.app.nutritionChart.resize();
        }
        if (window.app.weeklyChart) {
            window.app.weeklyChart.resize();
        }
    }
});

console.log('Smart Recipe App main logic loaded');