// Enhanced Smart Recipe App - Full Spoonacular Integration
class SmartRecipeApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.nutritionChart = null;
        this.weeklyChart = null;
        this.userProfile = {
            preferences: {
                dailyCalories: 2000,
                dailyProtein: 150,
                maxCookingTime: 45,
                budget: 50,
                familySize: 2
            },
            dietary: {
                diet: '', // ketogenic, vegetarian, vegan, paleo, etc.
                allergies: [], // milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans
                intolerances: [], // dairy, egg, gluten, grain, peanut, seafood, sesame, shellfish, soy, sulfite, tree nut, wheat
                dislikes: [], // ingredients user doesn't like
                cuisinePreferences: [] // american, asian, british, caribbean, central europe, chinese, eastern europe, european, french, german, greek, indian, irish, italian, japanese, jewish, korean, latin american, mediterranean, mexican, middle eastern, nordic, southern, spanish, thai, vietnamese
            },
            health: {
                goals: ['weight_loss'], // weight_loss, muscle_gain, maintenance, heart_healthy
                activityLevel: 'moderate', // sedentary, light, moderate, active, very_active
                restrictions: [] // low_sodium, low_sugar, low_fat, high_protein
            }
        };
        this.nutritionLogs = [];
        this.mealPlans = [];
        this.favoriteRecipes = [];
        this.searchHistory = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Enhanced Smart Recipe App...');
            
            // Wait for all dependencies
            await this.waitForDependencies();
            
            // Wait for Firebase auth
            if (window.firebaseConfig && window.firebaseConfig.auth) {
                this.currentUser = window.firebaseConfig.auth.currentUser;
            }
            
            // Load user data and preferences
            await this.loadUserProfile();
            
            // Update Spoonacular API with user preferences
            await this.updateSpoonacularProfile();
            
            // Initialize UI components
            this.initializeCharts();
            this.setupEventListeners();
            this.setupPreferenceManager();
            
            // Load initial page content
            this.showPage('dashboard');
            
            // Preload some data
            await this.preloadRecommendations();
            
            console.log('✅ Enhanced Smart Recipe App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async waitForDependencies() {
        const maxWait = 10000; // 10 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.spoonacularAPI && window.chartManager && window.nutritionTracker) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!window.spoonacularAPI) {
            throw new Error('Spoonacular API not available');
        }
    }

    async loadUserProfile() {
        try {
            if (!window.firebaseConfig?.helper) return;
            
            // Load user preferences
            const savedProfile = await window.firebaseConfig.helper.getUserData('userProfile');
            if (savedProfile) {
                this.userProfile = { ...this.userProfile, ...savedProfile };
            }
            
            // Load nutrition logs
            this.nutritionLogs = await window.firebaseConfig.helper.getUserDocuments('nutritionLogs') || [];
            
            // Load meal plans
            this.mealPlans = await window.firebaseConfig.helper.getUserDocuments('mealPlans') || [];
            
            // Load favorites
            this.favoriteRecipes = await window.firebaseConfig.helper.getUserDocuments('favoriteRecipes') || [];
            
            console.log('✅ User profile loaded successfully');
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
        }
    }

    async updateSpoonacularProfile() {
        if (window.spoonacularAPI) {
            const spoonacularProfile = {
                diet: this.userProfile.dietary.diet,
                allergies: this.userProfile.dietary.allergies,
                intolerances: this.userProfile.dietary.intolerances,
                dislikedIngredients: this.userProfile.dietary.dislikes,
                cuisinePreferences: this.userProfile.dietary.cuisinePreferences,
                preferredNutrition: {
                    maxCalories: Math.round(this.userProfile.preferences.dailyCalories / 3), // per meal
                    minProtein: Math.round(this.userProfile.preferences.dailyProtein / 3), // per meal
                    maxCarbs: this.userProfile.dietary.diet === 'ketogenic' ? 20 : 100,
                    maxFat: 50
                },
                timeConstraints: this.userProfile.preferences.maxCookingTime,
                budgetRange: this.userProfile.preferences.budget
            };
            
            window.spoonacularAPI.updateUserProfile(spoonacularProfile);
            console.log('✅ Spoonacular profile updated');
        }
    }

    setupPreferenceManager() {
        // Create preference management UI
        this.createPreferenceModal();
        
        // Set up preference update handlers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'updatePreferences') {
                this.showPreferenceModal();
            }
            if (e.target.id === 'savePreferences') {
                this.saveUserPreferences();
            }
        });
    }

    createPreferenceModal() {
        const modalHtml = `
            <div class="modal fade" id="preferencesModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user-cog me-2"></i>Your Preferences
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Dietary Preferences</h6>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Diet Type</label>
                                        <select class="form-select" id="dietType">
                                            <option value="">No specific diet</option>
                                            <option value="vegetarian">Vegetarian</option>
                                            <option value="vegan">Vegan</option>
                                            <option value="ketogenic">Ketogenic</option>
                                            <option value="paleo">Paleo</option>
                                            <option value="whole30">Whole30</option>
                                            <option value="mediterranean">Mediterranean</option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Food Allergies</label>
                                        <div class="preference-checkboxes" id="allergiesCheckboxes"></div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Food Intolerances</label>
                                        <div class="preference-checkboxes" id="intolerancesCheckboxes"></div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Cuisine Preferences</h6>
                                    <div class="preference-checkboxes" id="cuisineCheckboxes"></div>
                                    
                                    <h6 class="fw-bold mb-3 mt-4">Nutrition Goals</h6>
                                    
                                    <div class="row">
                                        <div class="col-6 mb-3">
                                            <label class="form-label">Daily Calories</label>
                                            <input type="number" class="form-control" id="dailyCaloriesInput" 
                                                   min="1000" max="5000" step="50">
                                        </div>
                                        <div class="col-6 mb-3">
                                            <label class="form-label">Daily Protein (g)</label>
                                            <input type="number" class="form-control" id="dailyProteinInput" 
                                                   min="30" max="300" step="5">
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-6 mb-3">
                                            <label class="form-label">Max Cook Time (min)</label>
                                            <input type="number" class="form-control" id="maxCookTimeInput" 
                                                   min="5" max="180" step="5">
                                        </div>
                                        <div class="col-6 mb-3">
                                            <label class="form-label">Daily Budget ($)</label>
                                            <input type="number" class="form-control" id="dailyBudgetInput" 
                                                   min="5" max="200" step="5">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="savePreferences">
                                <i class="fas fa-save me-2"></i>Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        document.getElementById('preferencesModal')?.remove();
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Populate checkboxes
        this.populatePreferenceCheckboxes();
    }

    populatePreferenceCheckboxes() {
        const allergies = ['milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soybeans'];
        const intolerances = ['dairy', 'egg', 'gluten', 'grain', 'peanut', 'seafood', 'sesame', 'shellfish', 'soy', 'sulfite', 'tree nut', 'wheat'];
        const cuisines = ['american', 'asian', 'british', 'chinese', 'french', 'german', 'greek', 'indian', 'italian', 'japanese', 'korean', 'mediterranean', 'mexican', 'thai', 'vietnamese'];
        
        this.createCheckboxGroup('allergiesCheckboxes', allergies, this.userProfile.dietary.allergies);
        this.createCheckboxGroup('intolerancesCheckboxes', intolerances, this.userProfile.dietary.intolerances);
        this.createCheckboxGroup('cuisineCheckboxes', cuisines, this.userProfile.dietary.cuisinePreferences);
    }

    createCheckboxGroup(containerId, options, selectedValues) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = options.map(option => `
            <div class="form-check form-check-inline mb-2">
                <input class="form-check-input" type="checkbox" value="${option}" 
                       id="${containerId}_${option}" ${selectedValues.includes(option) ? 'checked' : ''}>
                <label class="form-check-label" for="${containerId}_${option}">
                    ${option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
            </div>
        `).join('');
    }

    showPreferenceModal() {
        // Populate current values
        document.getElementById('dietType').value = this.userProfile.dietary.diet || '';
        document.getElementById('dailyCaloriesInput').value = this.userProfile.preferences.dailyCalories;
        document.getElementById('dailyProteinInput').value = this.userProfile.preferences.dailyProtein;
        document.getElementById('maxCookTimeInput').value = this.userProfile.preferences.maxCookingTime;
        document.getElementById('dailyBudgetInput').value = this.userProfile.preferences.budget;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('preferencesModal'));
        modal.show();
    }

    async saveUserPreferences() {
        try {
            // Collect all preferences
            const newProfile = {
                preferences: {
                    dailyCalories: parseInt(document.getElementById('dailyCaloriesInput').value),
                    dailyProtein: parseInt(document.getElementById('dailyProteinInput').value),
                    maxCookingTime: parseInt(document.getElementById('maxCookTimeInput').value),
                    budget: parseInt(document.getElementById('dailyBudgetInput').value),
                    familySize: this.userProfile.preferences.familySize
                },
                dietary: {
                    diet: document.getElementById('dietType').value,
                    allergies: this.getCheckedValues('allergiesCheckboxes'),
                    intolerances: this.getCheckedValues('intolerancesCheckboxes'),
                    dislikes: this.userProfile.dietary.dislikes,
                    cuisinePreferences: this.getCheckedValues('cuisineCheckboxes')
                },
                health: this.userProfile.health
            };
            
            this.userProfile = newProfile;
            
            // Save to Firebase
            if (window.firebaseConfig?.helper) {
                await window.firebaseConfig.helper.saveUserData('userProfile', this.userProfile);
            }
            
            // Update Spoonacular profile
            await this.updateSpoonacularProfile();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('preferencesModal'));
            modal.hide();
            
            // Refresh recommendations
            await this.refreshRecommendations();
            
            this.showSuccess('Preferences updated! Getting new recommendations...');
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.showError('Failed to save preferences');
        }
    }

    getCheckedValues(containerId) {
        const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    async preloadRecommendations() {
        try {
            // Get personalized recommendations
            const recommendations = await window.spoonacularAPI.getPersonalizedRecommendations(8);
            this.lastRecommendations = recommendations;
            
            console.log('✅ Preloaded recommendations:', recommendations.length);
        } catch (error) {
            console.error('❌ Error preloading recommendations:', error);
        }
    }

    async refreshRecommendations() {
        try {
            this.showLoading('recipeResults', 'Getting personalized recommendations...');
            
            const recommendations = await window.spoonacularAPI.getPersonalizedRecommendations(12);
            this.lastRecommendations = recommendations;
            this.displayRecipes(recommendations);
            
            console.log('✅ Refreshed recommendations based on preferences');
        } catch (error) {
            console.error('❌ Error refreshing recommendations:', error);
            this.showError('Failed to get new recommendations');
        }
    }

    setupEventListeners() {
        // Enhanced search with auto-suggestions
        const searchInput = document.getElementById('recipeSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    if (e.target.value.length >= 2) {
                        await this.showSearchSuggestions(e.target.value);
                    }
                    if (e.target.value.length >= 3) {
                        await this.searchRecipes(e.target.value);
                    }
                }, 300);
            });
        }

        // Enhanced filter handling
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAdvancedFilter(e.target);
            });
        });

        // Add preference button to navbar
        this.addPreferenceButton();
    }

    async showSearchSuggestions(query) {
        try {
            const suggestions = await window.spoonacularAPI.getAutocomplete(query, 5);
            this.displaySearchSuggestions(suggestions);
        } catch (error) {
            console.error('Error getting search suggestions:', error);
        }
    }

    displaySearchSuggestions(suggestions) {
        // Create or update suggestions dropdown
        let dropdown = document.getElementById('searchSuggestions');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'searchSuggestions';
            dropdown.className = 'search-suggestions';
            document.querySelector('.search-container').appendChild(dropdown);
        }
        
        if (suggestions.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        dropdown.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="app.selectSuggestion('${suggestion.title}')">
                ${suggestion.title}
            </div>
        `).join('');
        dropdown.style.display = 'block';
    }

    selectSuggestion(title) {
        document.getElementById('recipeSearch').value = title;
        document.getElementById('searchSuggestions').style.display = 'none';
        this.searchRecipes(title);
    }

    addPreferenceButton() {
        const navbar = document.querySelector('.navbar-nav.me-auto');
        if (navbar) {
            const preferenceItem = document.createElement('li');
            preferenceItem.className = 'nav-item';
            preferenceItem.innerHTML = `
                <a class="nav-link" href="#" id="updatePreferences">
                    <i class="fas fa-sliders-h me-1"></i>Preferences
                </a>
            `;
            navbar.appendChild(preferenceItem);
        }
    }

    async searchRecipes(query = '', filters = {}) {
        try {
            this.showLoading('recipeResults', 'Searching recipes...');
            
            // Add query to search history
            if (query && !this.searchHistory.includes(query)) {
                this.searchHistory.unshift(query);
                this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10
            }
            
            const searchOptions = {
                number: 12,
                offset: 0,
                ...filters
            };
            
            const result = await window.spoonacularAPI.searchRecipes(query, searchOptions);
            
            if (result.results && result.results.length > 0) {
                this.displayRecipes(result.results);
                this.showSuccess(`Found ${result.totalResults} recipes matching your criteria`);
            } else {
                this.displayNoResults(query);
            }
            
        } catch (error) {
            console.error('❌ Error searching recipes:', error);
            this.showError('Failed to search recipes. Please try again.');
        }
    }

    displayNoResults(query) {
        const container = document.getElementById('recipeResults');
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-12">
                <div class="no-results-card">
                    <div class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5>No recipes found</h5>
                        <p class="text-muted mb-4">
                            ${query ? `No recipes found for "${query}"` : 'No recipes match your current filters'}
                        </p>
                        <div class="suggested-actions">
                            <button class="btn btn-outline-primary me-2" onclick="app.clearAllFilters()">
                                Clear Filters
                            </button>
                            <button class="btn btn-primary" onclick="app.getPersonalizedSuggestions()">
                                Get Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async getPersonalizedSuggestions() {
        try {
            this.showLoading('recipeResults', 'Getting personalized suggestions...');
            const suggestions = await window.spoonacularAPI.getPersonalizedRecommendations(12);
            this.displayRecipes(suggestions);
            this.showSuccess('Here are some personalized suggestions for you!');
        } catch (error) {
            console.error('Error getting suggestions:', error);
            this.showError('Failed to get suggestions');
        }
    }

    displayRecipes(recipes) {
        const container = document.getElementById('recipeResults');
        if (!container) return;
        
        if (!recipes || recipes.length === 0) {
            this.displayNoResults();
            return;
        }
        
        container.innerHTML = recipes.map(recipe => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="recipe-card" data-recipe-id="${recipe.id}">
                    ${recipe.recommendationScore ? `
                        <div class="recommendation-score">
                            ${recipe.recommendationScore}% Match
                        </div>
                    ` : ''}
                    
                    <div class="recipe-image">
                        <img src="${recipe.image || `https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`}" 
                             alt="${recipe.title}" 
                             onerror="this.src='https://images.unsplash.com/photo-1546793665-c74683f339c1?w=312&h=231&fit=crop'">
                        <div class="recipe-overlay">
                            <button class="btn btn-light btn-sm" onclick="app.viewRecipe(${recipe.id})">
                                <i class="fas fa-eye me-1"></i>View
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="app.addToMealPlan(${recipe.id})">
                                <i class="fas fa-plus me-1"></i>Add
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="app.toggleFavorite(${recipe.id})">
                                <i class="fas fa-heart me-1"></i>Save
                            </button>
                        </div>
                    </div>
                    
                    <div class="recipe-content">
                        <h5 class="recipe-title">${recipe.title}</h5>
                        <div class="recipe-meta">
                            <span><i class="fas fa-clock"></i>${recipe.readyInMinutes || 30} min</span>
                            <span><i class="fas fa-fire"></i>${this.getRecipeCalories(recipe)} cal</span>
                            <span><i class="fas fa-users"></i>${recipe.servings || 2} servings</span>
                            ${recipe.healthScore ? `<span><i class="fas fa-heart"></i>${recipe.healthScore}/100</span>` : ''}
                        </div>
                        
                        ${recipe.matchReasons && recipe.matchReasons.length > 0 ? `
                            <div class="match-reasons">
                                ${recipe.matchReasons.slice(0, 3).map(reason => `
                                    <span class="match-reason">${reason}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${recipe.summary ? `
                            <p class="recipe-summary">${this.stripHtml(recipe.summary).substring(0, 120)}...</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getRecipeCalories(recipe) {
        if (recipe.nutrition?.nutrients) {
            const calories = recipe.nutrition.nutrients.find(n => n.name === 'Calories');
            return calories ? Math.round(calories.amount) : recipe.calories || 250;
        }
        return recipe.calories || 250;
    }

    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    async viewRecipe(recipeId) {
        try {
            this.showLoading('viewingRecipe', 'Loading recipe details...');
            
            const recipe = await window.spoonacularAPI.getRecipeInformation(recipeId);
            
            if (recipe) {
                this.showRecipeModal(recipe);
            }
        } catch (error) {
            console.error('❌ Error viewing recipe:', error);
            this.showError('Failed to load recipe details');
        } finally {
            this.hideLoading('viewingRecipe');
        }
    }

    showRecipeModal(recipe) {
        const modalContent = `
            <div class="modal fade" id="recipeModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${recipe.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${recipe.image}" class="img-fluid mb-3 rounded" alt="${recipe.title}">
                                    
                                    <div class="recipe-badges mb-3">
                                        ${recipe.vegetarian ? '<span class="badge bg-success me-1">Vegetarian</span>' : ''}
                                        ${recipe.vegan ? '<span class="badge bg-success me-1">Vegan</span>' : ''}
                                        ${recipe.glutenFree ? '<span class="badge bg-info me-1">Gluten Free</span>' : ''}
                                        ${recipe.dairyFree ? '<span class="badge bg-info me-1">Dairy Free</span>' : ''}
                                        ${recipe.ketogenic ? '<span class="badge bg-warning me-1">Keto</span>' : ''}
                                    </div>
                                    
                                    <div class="recipe-info">
                                        <div class="row text-center">
                                            <div class="col-3">
                                                <div class="info-item">
                                                    <i class="fas fa-clock text-primary"></i>
                                                    <div class="fw-bold">${recipe.readyInMinutes}</div>
                                                    <small class="text-muted">minutes</small>
                                                </div>
                                            </div>
                                            <div class="col-3">
                                                <div class="info-item">
                                                    <i class="fas fa-users text-success"></i>
                                                    <div class="fw-bold">${recipe.servings}</div>
                                                    <small class="text-muted">servings</small>
                                                </div>
                                            </div>
                                            <div class="col-3">
                                                <div class="info-item">
                                                    <i class="fas fa-fire text-danger"></i>
                                                    <div class="fw-bold">${this.getRecipeCalories(recipe)}</div>
                                                    <small class="text-muted">calories</small>
                                                </div>
                                            </div>
                                            <div class="col-3">
                                                <div class="info-item">
                                                    <i class="fas fa-heart text-warning"></i>
                                                    <div class="fw-bold">${recipe.healthScore || 'N/A'}</div>
                                                    <small class="text-muted">health</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    ${recipe.nutrition ? `
                                        <h6 class="fw-bold mb-3">Nutrition per serving:</h6>
                                        <div class="nutrition-grid">
                                            ${recipe.nutrition.nutrients?.slice(0, 8).map(n => `
                                                <div class="nutrition-item">
                                                    <span class="nutrient-name">${n.name}</span>
                                                    <span class="nutrient-value">${Math.round(n.amount)}${n.unit}</span>
                                                </div>
                                            `).join('') || ''}
                                        </div>
                                    ` : ''}
                                    
                                    ${recipe.extendedIngredients ? `
                                        <h6 class="fw-bold mb-3 mt-4">Ingredients:</h6>
                                        <ul class="ingredients-list">
                                            ${recipe.extendedIngredients.map(ing => `
                                                <li>${ing.original}</li>
                                            `).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            </div>
                            
                            ${recipe.instructions ? `
                                <div class="mt-4">
                                    <h6 class="fw-bold mb-3">Instructions:</h6>
                                    <div class="instructions">
                                        ${this.formatInstructions(recipe.instructions)}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${recipe.summary ? `
                                <div class="mt-4">
                                    <h6 class="fw-bold mb-3">About this recipe:</h6>
                                    <p>${this.stripHtml(recipe.summary)}</p>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-warning" onclick="app.toggleFavorite(${recipe.id})">
                                <i class="fas fa-heart me-1"></i>Save to Favorites
                            </button>
                            <button type="button" class="btn btn-primary" onclick="app.addToMealPlan(${recipe.id})">
                                <i class="fas fa-plus me-1"></i>Add to Meal Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        document.getElementById('recipeModal')?.remove();
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
        modal.show();
    }

    formatInstructions(instructions) {
        if (typeof instructions === 'string') {
            return `<p>${instructions}</p>`;
        }
        
        if (Array.isArray(instructions)) {
            return instructions.map((instruction, index) => {
                if (instruction.steps) {
                    return instruction.steps.map((step, stepIndex) => `
                        <div class="instruction-step">
                            <span class="step-number">${stepIndex + 1}</span>
                            <span class="step-text">${step.step}</span>
                        </div>
                    `).join('');
                }
                return `<div class="instruction-step">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-text">${instruction}</span>
                </div>`;
            }).join('');
        }
        
        return '<p>Instructions not available</p>';
    }

    async toggleFavorite(recipeId) {
        try {
            const existingIndex = this.favoriteRecipes.findIndex(fav => fav.recipeId === recipeId);
            
            if (existingIndex >= 0) {
                // Remove from favorites
                this.favoriteRecipes.splice(existingIndex, 1);
                this.showSuccess('Removed from favorites');
            } else {
                // Add to favorites
                const recipe = await window.spoonacularAPI.getRecipeInformation(recipeId);
                const favorite = {
                    recipeId: recipeId,
                    title: recipe.title,
                    image: recipe.image,
                    addedAt: new Date().toISOString()
                };
                
                this.favoriteRecipes.push(favorite);
                
                // Save to Firebase
                if (window.firebaseConfig?.helper) {
                    await window.firebaseConfig.helper.addDocument('favoriteRecipes', favorite);
                }
                
                this.showSuccess('Added to favorites!');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.showError('Failed to update favorites');
        }
    }

    async addToMealPlan(recipeId) {
        try {
            const recipe = await window.spoonacularAPI.getRecipeInformation(recipeId);
            
            if (!recipe) {
                this.showError('Recipe not found');
                return;
            }
            
            const mealPlanEntry = {
                recipeId: recipeId,
                recipeName: recipe.title,
                recipeImage: recipe.image,
                date: new Date().toISOString().split('T')[0],
                mealType: 'lunch', // Default to lunch
                calories: this.getRecipeCalories(recipe),
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                createdAt: new Date()
            };
            
            // Save to Firebase
            if (window.firebaseConfig?.helper) {
                await window.firebaseConfig.helper.addDocument('mealPlans', mealPlanEntry);
            }
            
            // Add to local data
            this.mealPlans.push(mealPlanEntry);
            
            this.showSuccess('Recipe added to meal plan!');
            
            // Close modal if open
            const modal = bootstrap.Modal.getInstance(document.getElementById('recipeModal'));
            if (modal) modal.hide();
            
        } catch (error) {
            console.error('❌ Error adding to meal plan:', error);
            this.showError('Failed to add recipe to meal plan');
        }
    }

    async handleAdvancedFilter(button) {
        // Toggle active state
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        await this.applyAdvancedFilter(filter);
    }

    async applyAdvancedFilter(filterType) {
        const filters = {};
        
        switch (filterType) {
            case 'all':
                await this.getPersonalizedSuggestions();
                return;
            case 'quick':
                filters.maxReadyTime = 20;
                break;
            case 'healthy':
                filters.minProtein = 25;
                filters.maxCalories = 400;
                break;
            case 'vegetarian':
                filters.diet = 'vegetarian';
                break;
            case 'low-carb':
                filters.maxCarbs = 25;
                break;
            case 'high-protein':
                filters.minProtein = 30;
                break;
        }
        
        await this.searchRecipes('', filters);
    }

    clearAllFilters() {
        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
        
        // Clear search
        document.getElementById('recipeSearch').value = '';
        
        // Get fresh personalized suggestions
        this.getPersonalizedSuggestions();
    }

    initializeCharts() {
        // Initialize charts with enhanced styling
        this.updateDashboardCharts();
    }

    updateDashboardCharts() {
        // Update nutrition chart
        if (window.chartManager) {
            const todayLogs = this.getTodaysNutritionLogs();
            const totals = this.calculateDailyTotals(todayLogs);
            
            window.chartManager.createNutritionChart('dashboardNutritionChart', {
                title: "Today's Nutrition",
                protein: totals.protein,
                carbs: totals.carbs,
                fat: totals.fat
            });
            
            // Update weekly chart
            window.chartManager.createWeeklyChart('weeklyProgressChart', {
                title: 'Weekly Progress',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                calories: this.getWeeklyCalories(),
                protein: this.getWeeklyProtein(),
                calorieGoal: this.userProfile.preferences.dailyCalories
            });
        }
    }

    getTodaysNutritionLogs() {
        const today = new Date().toISOString().split('T')[0];
        return this.nutritionLogs.filter(log => log.date === today);
    }

    calculateDailyTotals(logs) {
        return logs.reduce((totals, log) => {
            totals.calories += log.calories || 0;
            totals.protein += log.protein || 0;
            totals.carbs += log.carbs || 0;
            totals.fat += log.fat || 0;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    getWeeklyCalories() {
        // Generate sample weekly data - in real app would come from logs
        return [1800, 1950, 2100, 1750, 2200, 1600, 1900];
    }

    getWeeklyProtein() {
        // Generate sample weekly data - in real app would come from logs
        return [120, 135, 140, 110, 155, 95, 130];
    }

    showLoading(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="loading-spinner mb-3"></div>
                    <p class="text-muted">${message}</p>
                </div>
            `;
        }
    }

    hideLoading(containerId) {
        // Loading will be replaced by content
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertContainer.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertContainer.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(alertContainer);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 5000);
    }

    showPage(pageId) {
        try {
            // Hide all pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.style.display = 'none';
            });

            // Show selected page
            const targetPage = document.getElementById(pageId + 'Page');
            if (targetPage) {
                targetPage.style.display = 'block';
                this.currentPage = pageId;
                
                // Update navigation
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                document.querySelector(`[onclick="showPage('${pageId}')"]`)?.classList.add('active');
                
                // Load page-specific content
                this.loadPageContent(pageId);
            }
        } catch (error) {
            console.error('❌ Error showing page:', error);
        }
    }

    async loadPageContent(pageId) {
        try {
            switch (pageId) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'recipes':
                    await this.loadRecipes();
                    break;
                case 'nutrition':
                    this.updateDashboardCharts();
                    break;
                case 'meal-planner':
                    // Meal planner will be handled by meal-planner.js
                    break;
                case 'shopping':
                    // Shopping list will be handled by separate module
                    break;
                case 'health':
                    // Health tracker will be handled by separate module
                    break;
            }
        } catch (error) {
            console.error(`❌ Error loading ${pageId} content:`, error);
        }
    }

    async loadDashboard() {
        // Update stats
        const todayLogs = this.getTodaysNutritionLogs();
        const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        
        document.getElementById('todayCalories').textContent = totalCalories.toLocaleString();
        document.getElementById('recipesTracked').textContent = this.favoriteRecipes.length;
        
        const goalProgress = Math.round((totalCalories / this.userProfile.preferences.dailyCalories) * 100);
        document.getElementById('goalProgress').textContent = `${goalProgress}%`;
        
        // Update charts
        this.updateDashboardCharts();
    }

    async loadRecipes() {
        // Load personalized recommendations
        if (this.lastRecommendations && this.lastRecommendations.length > 0) {
            this.displayRecipes(this.lastRecommendations);
        } else {
            await this.getPersonalizedSuggestions();
        }
    }
}

// Global functions for HTML onclick events
window.showPage = function(pageId) {
    if (window.app) {
        window.app.showPage(pageId);
    }
};

window.searchRecipes = function() {
    const query = document.getElementById('recipeSearch')?.value || '';
    if (window.app) {
        window.app.searchRecipes(query);
    }
};

window.runAIAnalysis = function() {
    if (window.app) {
        window.app.getPersonalizedSuggestions();
    }
};

window.logout = function() {
    if (window.firebaseConfig && window.firebaseConfig.auth) {
        window.firebaseConfig.auth.signOut().then(() => {
            console.log('User signed out successfully');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    document.body.style.display = 'none';
    
    const initApp = () => {
        if (window.firebaseConfig && window.spoonacularAPI) {
            window.app = new SmartRecipeApp();
        } else {
            setTimeout(initApp, 100);
        }
    };
    
    initApp();
});

// Handle window resize for charts
window.addEventListener('resize', () => {
    if (window.app && window.chartManager) {
        window.chartManager.resizeAllCharts();
    }
});

console.log('🚀 Enhanced Smart Recipe App loaded successfully');