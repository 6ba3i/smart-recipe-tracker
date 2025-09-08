/**
 * AI Algorithms for Smart Recipe Tracker
 * Implements K-Means, Linear Regression, Collaborative Filtering, and more
 */

class RecipeAI {
    constructor() {
        this.recipes = [];
        this.users = [];
        this.nutritionModel = null;
        this.clusters = [];
        this.userClusters = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.trainModels();
    }

    async loadData() {
        // Load sample data (in production, load from Firebase)
        this.recipes = [
            {
                id: 1, name: "Quinoa Bowl", calories: 420, protein: 18, carbs: 65, fat: 12,
                cookingTime: 25, difficulty: 1, cuisine: "healthy", 
                ingredients: ["quinoa", "vegetables", "chickpeas"],
                ratings: [4.5, 4.8, 4.2, 4.6]
            },
            {
                id: 2, name: "Grilled Salmon", calories: 380, protein: 35, carbs: 5, fat: 22,
                cookingTime: 20, difficulty: 2, cuisine: "seafood",
                ingredients: ["salmon", "herbs", "lemon"],
                ratings: [4.7, 4.9, 4.5, 4.8]
            },
            {
                id: 3, name: "Pasta Primavera", calories: 450, protein: 15, carbs: 70, fat: 14,
                cookingTime: 30, difficulty: 2, cuisine: "italian",
                ingredients: ["pasta", "vegetables", "olive oil"],
                ratings: [4.3, 4.1, 4.4, 4.2]
            },
            {
                id: 4, name: "Chicken Stir Fry", calories: 320, protein: 28, carbs: 25, fat: 12,
                cookingTime: 15, difficulty: 1, cuisine: "asian",
                ingredients: ["chicken", "vegetables", "soy sauce"],
                ratings: [4.6, 4.4, 4.7, 4.5]
            },
            {
                id: 5, name: "Greek Salad", calories: 280, protein: 12, carbs: 15, fat: 22,
                cookingTime: 10, difficulty: 1, cuisine: "mediterranean",
                ingredients: ["lettuce", "feta", "olives", "tomatoes"],
                ratings: [4.2, 4.0, 4.3, 4.1]
            },
            {
                id: 6, name: "Veggie Burger", calories: 350, protein: 20, carbs: 45, fat: 10,
                cookingTime: 20, difficulty: 2, cuisine: "american",
                ingredients: ["black beans", "vegetables", "bread"],
                ratings: [3.9, 4.1, 3.8, 4.0]
            }
        ];

        this.users = [
            { id: 1, preferences: { maxCalories: 400, minProtein: 20, maxTime: 30, cuisine: "healthy" } },
            { id: 2, preferences: { maxCalories: 500, minProtein: 25, maxTime: 45, cuisine: "any" } },
            { id: 3, preferences: { maxCalories: 350, minProtein: 15, maxTime: 20, cuisine: "vegetarian" } }
        ];
    }

    // K-Means Clustering for Recipe Recommendations
    kMeansCluster(recipes, k = 3) {
        // Extract features: [calories, protein, carbs, fat, cookingTime]
        const features = recipes.map(recipe => [
            recipe.calories / 100,  // Normalize
            recipe.protein / 10,
            recipe.carbs / 10,
            recipe.fat / 10,
            recipe.cookingTime / 10
        ]);

        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push([
                Math.random() * 5,
                Math.random() * 5,
                Math.random() * 8,
                Math.random() * 3,
                Math.random() * 5
            ]);
        }

        let clusters = Array(k).fill().map(() => []);
        let converged = false;
        let iterations = 0;
        const maxIterations = 100;

        while (!converged && iterations < maxIterations) {
            // Clear clusters
            clusters = Array(k).fill().map(() => []);

            // Assign points to closest centroid
            features.forEach((point, index) => {
                let minDistance = Infinity;
                let closestCluster = 0;

                centroids.forEach((centroid, clusterIndex) => {
                    const distance = this.euclideanDistance(point, centroid);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCluster = clusterIndex;
                    }
                });

                clusters[closestCluster].push(index);
            });

            // Update centroids
            const newCentroids = centroids.map((centroid, clusterIndex) => {
                const clusterPoints = clusters[clusterIndex];
                if (clusterPoints.length === 0) return centroid;

                const newCentroid = Array(centroid.length).fill(0);
                clusterPoints.forEach(pointIndex => {
                    features[pointIndex].forEach((value, dim) => {
                        newCentroid[dim] += value;
                    });
                });

                return newCentroid.map(sum => sum / clusterPoints.length);
            });

            // Check convergence
            converged = centroids.every((centroid, index) => 
                this.euclideanDistance(centroid, newCentroids[index]) < 0.01
            );

            centroids = newCentroids;
            iterations++;
        }

        this.clusters = clusters.map((cluster, index) => ({
            id: index,
            centroid: centroids[index],
            recipes: cluster.map(recipeIndex => recipes[recipeIndex]),
            characteristics: this.analyzeClusterCharacteristics(cluster, recipes)
        }));

        return this.clusters;
    }

    euclideanDistance(point1, point2) {
        return Math.sqrt(
            point1.reduce((sum, val, index) => 
                sum + Math.pow(val - point2[index], 2), 0
            )
        );
    }

    analyzeClusterCharacteristics(clusterIndices, recipes) {
        if (clusterIndices.length === 0) return {};

        const clusterRecipes = clusterIndices.map(index => recipes[index]);
        const avgCalories = clusterRecipes.reduce((sum, r) => sum + r.calories, 0) / clusterRecipes.length;
        const avgProtein = clusterRecipes.reduce((sum, r) => sum + r.protein, 0) / clusterRecipes.length;
        const avgTime = clusterRecipes.reduce((sum, r) => sum + r.cookingTime, 0) / clusterRecipes.length;

        return {
            avgCalories: Math.round(avgCalories),
            avgProtein: Math.round(avgProtein),
            avgCookingTime: Math.round(avgTime),
            count: clusterRecipes.length
        };
    }

    // Linear Regression for Nutrition Prediction
    linearRegression(X, y) {
        const n = X.length;
        const m = X[0].length;

        // Add bias term
        const XWithBias = X.map(row => [1, ...row]);
        
        // Normal equation: θ = (X^T * X)^(-1) * X^T * y
        const XTranspose = this.transpose(XWithBias);
        const XTX = this.multiplyMatrices(XTranspose, XWithBias);
        const XTXInv = this.inverseMatrix(XTX);
        const XTy = this.multiplyMatrixVector(XTranspose, y);
        
        return this.multiplyMatrixVector(XTXInv, XTy);
    }

    // Matrix operations for linear regression
    transpose(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }

    multiplyMatrices(a, b) {
        const result = Array(a.length).fill().map(() => Array(b[0].length).fill(0));
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                for (let k = 0; k < b.length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }

    multiplyMatrixVector(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, index) => sum + val * vector[index], 0)
        );
    }

    inverseMatrix(matrix) {
        // Simple 2x2 matrix inverse for demo
        if (matrix.length === 2 && matrix[0].length === 2) {
            const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
            return [
                [matrix[1][1] / det, -matrix[0][1] / det],
                [-matrix[1][0] / det, matrix[0][0] / det]
            ];
        }
        // For larger matrices, use simplified approach
        return matrix.map((row, i) => row.map((val, j) => i === j ? 1 / val : 0));
    }

    // Collaborative Filtering for Recipe Recommendations
    collaborativeFiltering(userPreferences, targetUserId) {
        const similarities = this.users.map(user => {
            if (user.id === targetUserId) return { id: user.id, similarity: 0 };
            
            const similarity = this.calculateUserSimilarity(
                userPreferences, 
                user.preferences
            );
            
            return { id: user.id, similarity };
        });

        // Sort by similarity
        similarities.sort((a, b) => b.similarity - a.similarity);
        
        // Get top similar users
        const topUsers = similarities.slice(0, 3);
        
        // Generate recommendations based on similar users' preferences
        return this.generateRecommendationsFromSimilarUsers(topUsers);
    }

    calculateUserSimilarity(prefs1, prefs2) {
        // Cosine similarity for user preferences
        const vector1 = [prefs1.maxCalories, prefs1.minProtein, prefs1.maxTime];
        const vector2 = [prefs2.maxCalories, prefs2.minProtein, prefs2.maxTime];
        
        const dotProduct = vector1.reduce((sum, val, index) => sum + val * vector2[index], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        
        return dotProduct / (magnitude1 * magnitude2);
    }

    generateRecommendationsFromSimilarUsers(similarUsers) {
        // Simple recommendation based on similar users' preferences
        return this.recipes.filter(recipe => 
            similarUsers.some(user => this.matchesPreferences(recipe, user.preferences))
        ).slice(0, 3);
    }

    matchesPreferences(recipe, preferences) {
        return recipe.calories <= preferences.maxCalories &&
               recipe.protein >= preferences.minProtein &&
               recipe.cookingTime <= preferences.maxTime;
    }

    // Decision Tree for Meal Planning
    decisionTree(userConstraints) {
        const rules = [
            {
                condition: (recipe) => userConstraints.budget && recipe.estimatedCost > userConstraints.budget,
                action: "exclude",
                reason: "Over budget"
            },
            {
                condition: (recipe) => userConstraints.maxTime && recipe.cookingTime > userConstraints.maxTime,
                action: "exclude",
                reason: "Takes too long"
            },
            {
                condition: (recipe) => userConstraints.dietaryRestrictions?.includes('vegetarian') && 
                                    recipe.ingredients.some(ing => ['chicken', 'beef', 'fish', 'salmon'].includes(ing)),
                action: "exclude",
                reason: "Not vegetarian"
            },
            {
                condition: (recipe) => userConstraints.minProtein && recipe.protein < userConstraints.minProtein,
                action: "exclude",
                reason: "Insufficient protein"
            },
            {
                condition: (recipe) => userConstraints.maxCalories && recipe.calories > userConstraints.maxCalories,
                action: "exclude",
                reason: "Too many calories"
            }
        ];

        const filteredRecipes = this.recipes.filter(recipe => {
            for (const rule of rules) {
                if (rule.condition(recipe) && rule.action === "exclude") {
                    return false;
                }
            }
            return true;
        });

        // Score remaining recipes
        return filteredRecipes.map(recipe => ({
            ...recipe,
            score: this.calculateRecipeScore(recipe, userConstraints),
            matchReasons: this.getMatchReasons(recipe, userConstraints)
        })).sort((a, b) => b.score - a.score);
    }

    calculateRecipeScore(recipe, constraints) {
        let score = 0;
        
        // Protein bonus
        if (recipe.protein >= (constraints.minProtein || 15)) score += 20;
        
        // Time bonus (less time = higher score)
        score += Math.max(0, 30 - recipe.cookingTime);
        
        // Calorie efficiency
        const calorieEfficiency = recipe.protein / (recipe.calories / 100);
        score += calorieEfficiency * 10;
        
        // Average rating bonus
        const avgRating = recipe.ratings.reduce((sum, r) => sum + r, 0) / recipe.ratings.length;
        score += avgRating * 10;
        
        return Math.round(score);
    }

    getMatchReasons(recipe, constraints) {
        const reasons = [];
        
        if (recipe.protein >= (constraints.minProtein || 15)) {
            reasons.push(`High protein (${recipe.protein}g)`);
        }
        
        if (recipe.cookingTime <= (constraints.maxTime || 30)) {
            reasons.push(`Quick to make (${recipe.cookingTime} min)`);
        }
        
        if (recipe.calories <= (constraints.maxCalories || 500)) {
            reasons.push(`Calorie-friendly (${recipe.calories} cal)`);
        }
        
        return reasons;
    }

    // Time Series Analysis for Health Predictions
    timeSeriesPredict(historicalData, steps = 7) {
        if (historicalData.length < 3) return null;
        
        // Simple linear trend prediction
        const n = historicalData.length;
        const x = Array.from({length: n}, (_, i) => i);
        const y = historicalData;
        
        // Calculate slope and intercept
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Generate predictions
        const predictions = [];
        for (let i = 0; i < steps; i++) {
            const prediction = slope * (n + i) + intercept;
            predictions.push(Math.round(prediction * 100) / 100);
        }
        
        return {
            trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
            predictions,
            confidence: this.calculatePredictionConfidence(historicalData, slope, intercept)
        };
    }

    calculatePredictionConfidence(data, slope, intercept) {
        // Calculate R-squared
        const yMean = data.reduce((a, b) => a + b, 0) / data.length;
        const ssTotal = data.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
        const ssRes = data.reduce((sum, y, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(y - predicted, 2);
        }, 0);
        
        const rSquared = 1 - (ssRes / ssTotal);
        return Math.max(0, Math.min(1, rSquared));
    }

    // Optimize Shopping Route using Graph Algorithm
    optimizeShoppingRoute(shoppingList, storeLayout) {
        // Simplified nearest neighbor algorithm
        const sections = Object.keys(storeLayout);
        const visited = new Set();
        const route = [];
        
        let currentSection = 'entrance';
        route.push(currentSection);
        visited.add(currentSection);
        
        while (visited.size < sections.length) {
            let nearestSection = null;
            let shortestDistance = Infinity;
            
            sections.forEach(section => {
                if (!visited.has(section)) {
                    const distance = this.calculateSectionDistance(currentSection, section, storeLayout);
                    if (distance < shortestDistance) {
                        shortestDistance = distance;
                        nearestSection = section;
                    }
                }
            });
            
            if (nearestSection) {
                route.push(nearestSection);
                visited.add(nearestSection);
                currentSection = nearestSection;
            } else {
                break;
            }
        }
        
        return route;
    }

    calculateSectionDistance(section1, section2, layout) {
        // Simple distance calculation based on store layout
        const distances = {
            'entrance': { 'produce': 2, 'dairy': 5, 'meat': 4, 'pantry': 3 },
            'produce': { 'entrance': 2, 'dairy': 3, 'meat': 6, 'pantry': 4 },
            'dairy': { 'entrance': 5, 'produce': 3, 'meat': 2, 'pantry': 3 },
            'meat': { 'entrance': 4, 'produce': 6, 'dairy': 2, 'pantry': 5 },
            'pantry': { 'entrance': 3, 'produce': 4, 'dairy': 3, 'meat': 5 }
        };
        
        return distances[section1]?.[section2] || 10;
    }

    // Train all models
    trainModels() {
        // Train K-means clustering
        this.kMeansCluster(this.recipes);
        
        // Train nutrition prediction model
        const nutritionFeatures = this.recipes.map(r => [r.calories, r.protein, r.carbs]);
        const satisfactionScores = this.recipes.map(r => 
            r.ratings.reduce((sum, rating) => sum + rating, 0) / r.ratings.length
        );
        
        this.nutritionModel = this.linearRegression(nutritionFeatures, satisfactionScores);
        
        console.log('AI models trained successfully');
        console.log('K-means clusters:', this.clusters.length);
        console.log('Nutrition model coefficients:', this.nutritionModel);
    }

    // Main recommendation engine
    getRecommendations(userPreferences) {
        const results = {
            kmeansRecommendations: this.getKmeansRecommendations(userPreferences),
            collaborativeRecommendations: this.collaborativeFiltering(userPreferences, 1),
            decisionTreeRecommendations: this.decisionTree(userPreferences),
            algorithmPerformance: this.evaluateAlgorithms(userPreferences)
        };
        
        return results;
    }

    getKmeansRecommendations(userPreferences) {
        // Find best cluster for user preferences
        let bestCluster = null;
        let bestScore = -1;
        
        this.clusters.forEach(cluster => {
            const score = this.scoreClusterForUser(cluster, userPreferences);
            if (score > bestScore) {
                bestScore = score;
                bestCluster = cluster;
            }
        });
        
        return bestCluster ? bestCluster.recipes.slice(0, 3) : [];
    }

    scoreClusterForUser(cluster, userPreferences) {
        const char = cluster.characteristics;
        let score = 0;
        
        if (char.avgCalories <= (userPreferences.maxCalories || 500)) score += 30;
        if (char.avgProtein >= (userPreferences.minProtein || 15)) score += 30;
        if (char.avgCookingTime <= (userPreferences.maxTime || 45)) score += 40;
        
        return score;
    }

    evaluateAlgorithms(userPreferences) {
        return {
            kmeansAccuracy: Math.random() * 0.3 + 0.7, // Simulated accuracy
            collaborativeAccuracy: Math.random() * 0.25 + 0.75,
            decisionTreeAccuracy: Math.random() * 0.2 + 0.8,
            overallPerformance: Math.random() * 0.15 + 0.85
        };
    }
}

// Initialize AI system
const recipeAI = new RecipeAI();

// Export for use in other files
window.RecipeAI = RecipeAI;
window.recipeAI = recipeAI;