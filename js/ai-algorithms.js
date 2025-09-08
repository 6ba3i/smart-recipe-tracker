// Advanced AI Algorithms for Recipe Recommendation System
class RecipeAI {
    constructor() {
        this.recipes = this.loadRecipeDatabase();
        this.users = this.generateSampleUsers();
        this.clusters = [];
        this.nutritionModel = null;
        this.collaborativeMatrix = null;
        this.performanceMetrics = {
            kmeans: { accuracy: 0, precision: 0, recall: 0 },
            collaborative: { accuracy: 0, rmse: 0 },
            decisionTree: { accuracy: 0, depth: 0 },
            overall: { trainTime: 0, predictions: 0 }
        };
        
        console.log('RecipeAI initialized with', this.recipes.length, 'recipes');
    }

    // Load comprehensive recipe database
    loadRecipeDatabase() {
        return [
            {
                id: 1,
                title: "Mediterranean Grilled Chicken",
                calories: 320,
                protein: 35,
                carbs: 8,
                fat: 15,
                cookingTime: 25,
                ingredients: ["chicken", "olive oil", "lemon", "herbs", "tomatoes"],
                cuisine: "mediterranean",
                difficulty: "easy",
                estimatedCost: 12,
                ratings: [4.5, 4.2, 4.8, 4.1, 4.6],
                tags: ["healthy", "high-protein", "low-carb"],
                image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop"
            },
            {
                id: 2,
                title: "Quinoa Buddha Bowl",
                calories: 380,
                protein: 16,
                carbs: 52,
                fat: 12,
                cookingTime: 30,
                ingredients: ["quinoa", "chickpeas", "avocado", "spinach", "tahini"],
                cuisine: "international",
                difficulty: "medium",
                estimatedCost: 8,
                ratings: [4.3, 4.0, 4.5, 4.2, 4.4],
                tags: ["vegetarian", "healthy", "high-fiber"],
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop"
            },
            {
                id: 3,
                title: "Salmon with Roasted Vegetables",
                calories: 420,
                protein: 35,
                carbs: 20,
                fat: 24,
                cookingTime: 35,
                ingredients: ["salmon", "broccoli", "sweet potato", "olive oil", "garlic"],
                cuisine: "american",
                difficulty: "medium",
                estimatedCost: 18,
                ratings: [4.7, 4.5, 4.8, 4.6, 4.9],
                tags: ["healthy", "omega-3", "low-carb"],
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop"
            },
            {
                id: 4,
                title: "Vegetarian Stir-Fry",
                calories: 280,
                protein: 12,
                carbs: 35,
                fat: 8,
                cookingTime: 15,
                ingredients: ["tofu", "bell peppers", "broccoli", "soy sauce", "ginger"],
                cuisine: "asian",
                difficulty: "easy",
                estimatedCost: 7,
                ratings: [4.1, 3.9, 4.3, 4.0, 4.2],
                tags: ["vegetarian", "quick", "low-fat"],
                image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop"
            },
            {
                id: 5,
                title: "Greek Yogurt Parfait",
                calories: 180,
                protein: 20,
                carbs: 22,
                fat: 3,
                cookingTime: 5,
                ingredients: ["greek yogurt", "berries", "granola", "honey"],
                cuisine: "international",
                difficulty: "easy",
                estimatedCost: 4,
                ratings: [4.4, 4.6, 4.2, 4.5, 4.3],
                tags: ["breakfast", "healthy", "high-protein", "quick"],
                image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop"
            },
            {
                id: 6,
                title: "Turkey and Avocado Wrap",
                calories: 350,
                protein: 25,
                carbs: 28,
                fat: 16,
                cookingTime: 10,
                ingredients: ["turkey", "avocado", "spinach", "tomato", "whole wheat wrap"],
                cuisine: "american",
                difficulty: "easy",
                estimatedCost: 6,
                ratings: [4.2, 4.0, 4.4, 4.1, 4.3],
                tags: ["lunch", "portable", "balanced"],
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"
            },
            {
                id: 7,
                title: "Lentil Curry",
                calories: 310,
                protein: 18,
                carbs: 45,
                fat: 6,
                cookingTime: 40,
                ingredients: ["lentils", "coconut milk", "curry spices", "onion", "garlic"],
                cuisine: "indian",
                difficulty: "medium",
                estimatedCost: 5,
                ratings: [4.6, 4.4, 4.7, 4.5, 4.8],
                tags: ["vegetarian", "high-fiber", "budget-friendly"],
                image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=300&h=200&fit=crop"
            },
            {
                id: 8,
                title: "Baked Cod with Herbs",
                calories: 220,
                protein: 30,
                carbs: 5,
                fat: 8,
                cookingTime: 20,
                ingredients: ["cod", "herbs", "lemon", "olive oil", "garlic"],
                cuisine: "mediterranean",
                difficulty: "easy",
                estimatedCost: 14,
                ratings: [4.3, 4.1, 4.5, 4.2, 4.4],
                tags: ["low-calorie", "high-protein", "omega-3"],
                image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop"
            },
            {
                id: 9,
                title: "Chocolate Protein Smoothie",
                calories: 250,
                protein: 25,
                carbs: 20,
                fat: 8,
                cookingTime: 5,
                ingredients: ["protein powder", "banana", "almond milk", "cocoa", "peanut butter"],
                cuisine: "international",
                difficulty: "easy",
                estimatedCost: 3,
                ratings: [4.5, 4.7, 4.3, 4.6, 4.4],
                tags: ["smoothie", "post-workout", "high-protein", "quick"],
                image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop"
            },
            {
                id: 10,
                title: "Caprese Salad",
                calories: 180,
                protein: 12,
                carbs: 8,
                fat: 12,
                cookingTime: 10,
                ingredients: ["mozzarella", "tomatoes", "basil", "balsamic", "olive oil"],
                cuisine: "italian",
                difficulty: "easy",
                estimatedCost: 8,
                ratings: [4.4, 4.2, 4.6, 4.3, 4.5],
                tags: ["salad", "vegetarian", "fresh", "quick"],
                image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300&h=200&fit=crop"
            }
        ];
    }

    // Generate realistic user profiles for collaborative filtering
    generateSampleUsers() {
        const users = [];
        const preferences = [
            { type: "health-conscious", maxCalories: 400, minProtein: 20, preferredCuisines: ["mediterranean", "asian"] },
            { type: "fitness-focused", maxCalories: 500, minProtein: 30, preferredCuisines: ["american", "international"] },
            { type: "vegetarian", maxCalories: 450, minProtein: 15, dietaryRestrictions: ["vegetarian"], preferredCuisines: ["indian", "mediterranean"] },
            { type: "busy-professional", maxCookingTime: 20, maxCalories: 600, preferredCuisines: ["international", "american"] },
            { type: "budget-conscious", maxCost: 10, maxCalories: 500, preferredCuisines: ["indian", "asian"] }
        ];

        for (let i = 0; i < 50; i++) {
            const basePrefs = preferences[i % preferences.length];
            const user = {
                id: i + 1,
                preferences: {
                    ...basePrefs,
                    maxCalories: basePrefs.maxCalories + (Math.random() - 0.5) * 100,
                    minProtein: (basePrefs.minProtein || 15) + (Math.random() - 0.5) * 10,
                    maxTime: basePrefs.maxCookingTime || (20 + Math.random() * 30)
                },
                ratings: this.generateUserRatings()
            };
            users.push(user);
        }

        return users;
    }

    generateUserRatings() {
        const ratings = {};
        // Each user rates 60-80% of recipes
        const numRatings = Math.floor(this.recipes.length * (0.6 + Math.random() * 0.2));
        const recipeIds = this.recipes.map(r => r.id).sort(() => Math.random() - 0.5).slice(0, numRatings);
        
        recipeIds.forEach(id => {
            // Generate realistic ratings (bias toward higher ratings)
            ratings[id] = Math.max(1, Math.min(5, Math.round((Math.random() * 2 + 3) * 10) / 10));
        });

        return ratings;
    }

    // K-Means Clustering Implementation
    kMeansCluster(recipes, k = 3) {
        const startTime = performance.now();
        
        // Extract features for clustering
        const features = recipes.map(recipe => [
            recipe.calories / 100,  // Normalize calories
            recipe.protein / 10,    // Normalize protein
            recipe.carbs / 10,      // Normalize carbs
            recipe.fat / 10,        // Normalize fat
            recipe.cookingTime / 10 // Normalize cooking time
        ]);

        // Initialize centroids randomly
        let centroids = this.initializeCentroids(features, k);
        let clusters = [];
        let previousCentroids = null;
        let iterations = 0;
        const maxIterations = 100;

        // K-means iteration
        while (iterations < maxIterations && !this.centroidsConverged(centroids, previousCentroids)) {
            previousCentroids = centroids.map(c => [...c]);
            clusters = this.assignToClusters(features, centroids);
            centroids = this.updateCentroids(features, clusters, k);
            iterations++;
        }

        // Create cluster objects with recipes and characteristics
        this.clusters = clusters.map((cluster, index) => {
            const clusterRecipes = cluster.map(i => recipes[i]);
            return {
                id: index,
                recipes: clusterRecipes,
                centroid: centroids[index],
                characteristics: this.calculateClusterCharacteristics(clusterRecipes),
                size: cluster.length
            };
        });

        const endTime = performance.now();
        this.performanceMetrics.kmeans = {
            accuracy: this.calculateClusterAccuracy(),
            iterations: iterations,
            convergenceTime: endTime - startTime,
            silhouetteScore: this.calculateSilhouetteScore(features, clusters, centroids)
        };

        console.log(`K-means clustering completed in ${iterations} iterations`);
        console.log('Cluster sizes:', this.clusters.map(c => c.size));
        return this.clusters;
    }

    initializeCentroids(features, k) {
        const centroids = [];
        const numFeatures = features[0].length;
        
        for (let i = 0; i < k; i++) {
            const centroid = [];
            for (let j = 0; j < numFeatures; j++) {
                const values = features.map(f => f[j]);
                const min = Math.min(...values);
                const max = Math.max(...values);
                centroid.push(min + Math.random() * (max - min));
            }
            centroids.push(centroid);
        }
        
        return centroids;
    }

    assignToClusters(features, centroids) {
        const clusters = centroids.map(() => []);
        
        features.forEach((feature, index) => {
            let minDistance = Infinity;
            let closestCluster = 0;
            
            centroids.forEach((centroid, clusterIndex) => {
                const distance = this.euclideanDistance(feature, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = clusterIndex;
                }
            });
            
            clusters[closestCluster].push(index);
        });
        
        return clusters;
    }

    updateCentroids(features, clusters, k) {
        const newCentroids = [];
        
        for (let i = 0; i < k; i++) {
            if (clusters[i].length === 0) {
                // If cluster is empty, reinitialize randomly
                newCentroids.push(this.initializeCentroids(features, 1)[0]);
            } else {
                const clusterFeatures = clusters[i].map(index => features[index]);
                const centroid = [];
                
                for (let j = 0; j < features[0].length; j++) {
                    const sum = clusterFeatures.reduce((acc, feature) => acc + feature[j], 0);
                    centroid.push(sum / clusterFeatures.length);
                }
                
                newCentroids.push(centroid);
            }
        }
        
        return newCentroids;
    }

    euclideanDistance(point1, point2) {
        return Math.sqrt(
            point1.reduce((sum, val, index) => 
                sum + Math.pow(val - point2[index], 2), 0
            )
        );
    }

    centroidsConverged(current, previous, tolerance = 0.0001) {
        if (!previous) return false;
        
        for (let i = 0; i < current.length; i++) {
            for (let j = 0; j < current[i].length; j++) {
                if (Math.abs(current[i][j] - previous[i][j]) > tolerance) {
                    return false;
                }
            }
        }
        return true;
    }

    calculateClusterCharacteristics(recipes) {
        const totals = recipes.reduce((acc, recipe) => {
            acc.calories += recipe.calories;
            acc.protein += recipe.protein;
            acc.carbs += recipe.carbs;
            acc.fat += recipe.fat;
            acc.cookingTime += recipe.cookingTime;
            acc.cost += recipe.estimatedCost;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, cookingTime: 0, cost: 0 });

        const count = recipes.length;
        const avgRating = recipes.reduce((sum, recipe) => {
            const recipeAvg = recipe.ratings.reduce((a, b) => a + b, 0) / recipe.ratings.length;
            return sum + recipeAvg;
        }, 0) / count;

        return {
            avgCalories: Math.round(totals.calories / count),
            avgProtein: Math.round(totals.protein / count),
            avgCarbs: Math.round(totals.carbs / count),
            avgFat: Math.round(totals.fat / count),
            avgCookingTime: Math.round(totals.cookingTime / count),
            avgCost: Math.round(totals.cost / count),
            avgRating: Math.round(avgRating * 10) / 10,
            cuisines: [...new Set(recipes.map(r => r.cuisine))],
            tags: [...new Set(recipes.flatMap(r => r.tags))]
        };
    }

    calculateClusterAccuracy() {
        // Calculate internal cluster coherence
        let totalScore = 0;
        let comparisons = 0;

        this.clusters.forEach(cluster => {
            const recipes = cluster.recipes;
            for (let i = 0; i < recipes.length; i++) {
                for (let j = i + 1; j < recipes.length; j++) {
                    const similarity = this.calculateRecipeSimilarity(recipes[i], recipes[j]);
                    totalScore += similarity;
                    comparisons++;
                }
            }
        });

        return comparisons > 0 ? totalScore / comparisons : 0;
    }

    calculateRecipeSimilarity(recipe1, recipe2) {
        // Calculate similarity based on nutritional content and tags
        const nutritionSim = 1 - Math.abs(recipe1.calories - recipe2.calories) / 500;
        const proteinSim = 1 - Math.abs(recipe1.protein - recipe2.protein) / 40;
        const tagSim = recipe1.tags.filter(tag => recipe2.tags.includes(tag)).length / 
                      Math.max(recipe1.tags.length, recipe2.tags.length);
        
        return (nutritionSim + proteinSim + tagSim) / 3;
    }

    calculateSilhouetteScore(features, clusters, centroids) {
        let totalScore = 0;
        let count = 0;

        clusters.forEach((cluster, clusterIndex) => {
            cluster.forEach(pointIndex => {
                const point = features[pointIndex];
                
                // Calculate average distance to points in same cluster
                const intraClusterDistances = cluster
                    .filter(i => i !== pointIndex)
                    .map(i => this.euclideanDistance(point, features[i]));
                const a = intraClusterDistances.length > 0 ? 
                    intraClusterDistances.reduce((sum, d) => sum + d, 0) / intraClusterDistances.length : 0;

                // Calculate minimum average distance to points in other clusters
                let minInterClusterDistance = Infinity;
                clusters.forEach((otherCluster, otherIndex) => {
                    if (otherIndex !== clusterIndex) {
                        const distances = otherCluster.map(i => this.euclideanDistance(point, features[i]));
                        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
                        minInterClusterDistance = Math.min(minInterClusterDistance, avgDistance);
                    }
                });

                const b = minInterClusterDistance;
                const silhouette = (b - a) / Math.max(a, b);
                totalScore += silhouette;
                count++;
            });
        });

        return count > 0 ? totalScore / count : 0;
    }

    // Linear Regression for Nutrition Prediction
    linearRegression(features, targets) {
        const startTime = performance.now();
        
        // Add bias column
        const X = features.map(row => [1, ...row]);
        const y = targets;
        
        // Normal equation: θ = (X^T * X)^(-1) * X^T * y
        const XTranspose = this.transpose(X);
        const XTX = this.matrixMultiply(XTranspose, X);
        const XTXInverse = this.matrixInverse(XTX);
        const XTy = this.matrixVectorMultiply(XTranspose, y);
        const coefficients = this.matrixVectorMultiply(XTXInverse, XTy);
        
        const endTime = performance.now();
        
        // Calculate R-squared and RMSE
        const predictions = X.map(row => this.predict(row.slice(1), coefficients));
        const rSquared = this.calculateRSquared(y, predictions);
        const rmse = this.calculateRMSE(y, predictions);
        
        this.performanceMetrics.collaborative = {
            accuracy: rSquared,
            rmse: rmse,
            trainTime: endTime - startTime,
            coefficients: coefficients.length
        };

        return {
            coefficients: coefficients,
            rSquared: rSquared,
            rmse: rmse
        };
    }

    predict(features, coefficients) {
        return coefficients[0] + features.reduce((sum, feature, index) => 
            sum + feature * coefficients[index + 1], 0);
    }

    calculateRSquared(actual, predicted) {
        const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
        const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
        const residualSumSquares = actual.reduce((sum, val, index) => 
            sum + Math.pow(val - predicted[index], 2), 0);
        
        return 1 - (residualSumSquares / totalSumSquares);
    }

    calculateRMSE(actual, predicted) {
        const mse = actual.reduce((sum, val, index) => 
            sum + Math.pow(val - predicted[index], 2), 0) / actual.length;
        return Math.sqrt(mse);
    }

    // Matrix operations
    transpose(matrix) {
        return matrix[0].map((col, i) => matrix.map(row => row[i]));
    }

    matrixMultiply(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < b.length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    matrixVectorMultiply(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, index) => sum + val * vector[index], 0)
        );
    }

    matrixInverse(matrix) {
        // Simple 2x2 matrix inverse for demonstration
        // In practice, would use more robust methods like LU decomposition
        const n = matrix.length;
        const identity = Array(n).fill().map((_, i) => 
            Array(n).fill().map((_, j) => i === j ? 1 : 0)
        );
        
        const augmented = matrix.map((row, i) => [...row, ...identity[i]]);
        
        // Gaussian elimination
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            // Swap rows
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
            
            // Make diagonal 1
            const pivot = augmented[i][i];
            for (let j = 0; j < 2 * n; j++) {
                augmented[i][j] /= pivot;
            }
            
            // Eliminate column
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = augmented[k][i];
                    for (let j = 0; j < 2 * n; j++) {
                        augmented[k][j] -= factor * augmented[i][j];
                    }
                }
            }
        }
        
        return augmented.map(row => row.slice(n));
    }

    // Collaborative Filtering
    collaborativeFiltering(targetUser, userId = null) {
        const startTime = performance.now();
        
        // Build user-item rating matrix
        this.collaborativeMatrix = this.buildRatingMatrix();
        
        // Find similar users
        const similarUsers = this.findSimilarUsers(targetUser, 5);
        
        // Generate recommendations based on similar users
        const recommendations = this.generateCollaborativeRecommendations(targetUser, similarUsers);
        
        const endTime = performance.now();
        this.performanceMetrics.collaborative.trainTime = endTime - startTime;
        
        return recommendations;
    }

    buildRatingMatrix() {
        const matrix = {};
        this.users.forEach(user => {
            matrix[user.id] = user.ratings;
        });
        return matrix;
    }

    findSimilarUsers(targetPreferences, topK = 5) {
        const similarities = this.users.map(user => ({
            user: user,
            similarity: this.calculateUserSimilarity(targetPreferences, user.preferences)
        }));
        
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    calculateUserSimilarity(prefs1, prefs2) {
        // Cosine similarity based on preferences
        const features1 = [
            prefs1.maxCalories || 400,
            prefs1.minProtein || 15,
            prefs1.maxTime || 30
        ];
        
        const features2 = [
            prefs2.maxCalories || 400,
            prefs2.minProtein || 15,
            prefs2.maxTime || 30
        ];
        
        const dotProduct = features1.reduce((sum, val, index) => sum + val * features2[index], 0);
        const magnitude1 = Math.sqrt(features1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(features2.reduce((sum, val) => sum + val * val, 0));
        
        return dotProduct / (magnitude1 * magnitude2);
    }

    generateCollaborativeRecommendations(targetPreferences, similarUsers) {
        // Weight recipes by similar user ratings
        const recipeScores = {};
        
        similarUsers.forEach(({ user, similarity }) => {
            Object.entries(user.ratings).forEach(([recipeId, rating]) => {
                if (!recipeScores[recipeId]) {
                    recipeScores[recipeId] = { totalScore: 0, totalWeight: 0 };
                }
                recipeScores[recipeId].totalScore += rating * similarity;
                recipeScores[recipeId].totalWeight += similarity;
            });
        });
        
        // Calculate weighted average ratings
        const recommendations = Object.entries(recipeScores)
            .map(([recipeId, scores]) => ({
                recipeId: parseInt(recipeId),
                predictedRating: scores.totalScore / scores.totalWeight
            }))
            .sort((a, b) => b.predictedRating - a.predictedRating)
            .slice(0, 3);
        
        return recommendations
            .map(rec => this.recipes.find(r => r.id === rec.recipeId))
            .filter(Boolean);
    }

    // Decision Tree for Meal Planning
    decisionTree(userConstraints) {
        const startTime = performance.now();
        
        const rules = [
            {
                condition: (recipe) => userConstraints.budget && recipe.estimatedCost > userConstraints.budget,
                action: "exclude",
                reason: "Over budget",
                weight: 0.9
            },
            {
                condition: (recipe) => userConstraints.maxTime && recipe.cookingTime > userConstraints.maxTime,
                action: "exclude",
                reason: "Takes too long",
                weight: 0.8
            },
            {
                condition: (recipe) => userConstraints.dietaryRestrictions?.includes('vegetarian') && 
                                    recipe.ingredients.some(ing => ['chicken', 'beef', 'fish', 'salmon', 'turkey'].includes(ing)),
                action: "exclude",
                reason: "Not vegetarian",
                weight: 1.0
            },
            {
                condition: (recipe) => userConstraints.minProtein && recipe.protein < userConstraints.minProtein,
                action: "exclude",
                reason: "Insufficient protein",
                weight: 0.7
            },
            {
                condition: (recipe) => userConstraints.maxCalories && recipe.calories > userConstraints.maxCalories,
                action: "exclude",
                reason: "Too many calories",
                weight: 0.6
            },
            {
                condition: (recipe) => userConstraints.preferredCuisines && 
                                    userConstraints.preferredCuisines.includes(recipe.cuisine),
                action: "boost",
                reason: "Preferred cuisine",
                weight: 0.5
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
        const scoredRecipes = filteredRecipes.map(recipe => ({
            ...recipe,
            score: this.calculateRecipeScore(recipe, userConstraints, rules),
            matchReasons: this.getMatchReasons(recipe, userConstraints, rules)
        })).sort((a, b) => b.score - a.score);

        const endTime = performance.now();
        this.performanceMetrics.decisionTree = {
            accuracy: this.calculateDecisionTreeAccuracy(scoredRecipes, userConstraints),
            rulesApplied: rules.length,
            processTime: endTime - startTime,
            coverage: filteredRecipes.length / this.recipes.length
        };

        return scoredRecipes.slice(0, 5);
    }

    calculateRecipeScore(recipe, constraints, rules) {
        let score = 0;
        
        // Base score from average rating
        const avgRating = recipe.ratings.reduce((sum, r) => sum + r, 0) / recipe.ratings.length;
        score += avgRating * 20;
        
        // Protein bonus
        if (recipe.protein >= (constraints.minProtein || 15)) {
            score += 25;
        }
        
        // Time efficiency (less time = higher score)
        score += Math.max(0, 30 - recipe.cookingTime);
        
        // Calorie efficiency (protein per 100 calories)
        const calorieEfficiency = recipe.protein / (recipe.calories / 100);
        score += calorieEfficiency * 8;
        
        // Cost efficiency
        if (constraints.budget) {
            const costEfficiency = 1 - (recipe.estimatedCost / constraints.budget);
            score += Math.max(0, costEfficiency * 15);
        }
        
        // Apply boost rules
        rules.forEach(rule => {
            if (rule.action === "boost" && rule.condition(recipe)) {
                score += rule.weight * 20;
            }
        });
        
        return Math.round(score);
    }

    getMatchReasons(recipe, constraints, rules) {
        const reasons = [];
        
        if (recipe.protein >= (constraints.minProtein || 15)) {
            reasons.push("High protein content");
        }
        if (recipe.cookingTime <= (constraints.maxTime || 30)) {
            reasons.push("Quick to prepare");
        }
        if (constraints.budget && recipe.estimatedCost <= constraints.budget) {
            reasons.push("Within budget");
        }
        if (recipe.calories <= (constraints.maxCalories || 500)) {
            reasons.push("Calorie-friendly");
        }
        
        // Check boost rules
        rules.forEach(rule => {
            if (rule.action === "boost" && rule.condition(recipe)) {
                reasons.push(rule.reason);
            }
        });
        
        return reasons;
    }

    calculateDecisionTreeAccuracy(scoredRecipes, constraints) {
        // Calculate how well the scoring matches expected preferences
        let correctPredictions = 0;
        scoredRecipes.forEach(recipe => {
            let expectedGood = true;
            
            if (constraints.maxCalories && recipe.calories > constraints.maxCalories * 1.1) {
                expectedGood = false;
            }
            if (constraints.minProtein && recipe.protein < constraints.minProtein * 0.8) {
                expectedGood = false;
            }
            
            const actualGood = recipe.score > 60; // Threshold for good recipes
            if (expectedGood === actualGood) {
                correctPredictions++;
            }
        });
        
        return scoredRecipes.length > 0 ? correctPredictions / scoredRecipes.length : 0;
    }

    // Genetic Algorithm for Meal Planning
    generateOptimalMealPlan(userPreferences, days = 7) {
        const startTime = performance.now();
        
        const populationSize = 50;
        const generations = 100;
        const mutationRate = 0.1;
        const eliteSize = 10;
        
        // Initialize population
        let population = this.initializePopulation(populationSize, days);
        
        for (let generation = 0; generation < generations; generation++) {
            // Evaluate fitness
            const fitness = population.map(individual => 
                this.evaluateMealPlanFitness(individual, userPreferences)
            );
            
            // Selection and reproduction
            const newPopulation = [];
            
            // Keep elite individuals
            const elite = this.selectElite(population, fitness, eliteSize);
            newPopulation.push(...elite);
            
            // Generate offspring
            while (newPopulation.length < populationSize) {
                const parent1 = this.tournamentSelection(population, fitness);
                const parent2 = this.tournamentSelection(population, fitness);
                const offspring = this.crossover(parent1, parent2);
                
                if (Math.random() < mutationRate) {
                    this.mutate(offspring);
                }
                
                newPopulation.push(offspring);
            }
            
            population = newPopulation;
        }
        
        // Return best meal plan
        const finalFitness = population.map(individual => 
            this.evaluateMealPlanFitness(individual, userPreferences)
        );
        
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
        const bestPlan = population[bestIndex];
        
        const endTime = performance.now();
        
        return {
            mealPlan: this.formatMealPlan(bestPlan),
            fitness: finalFitness[bestIndex],
            generations: generations,
            processingTime: endTime - startTime,
            metrics: this.analyzeMealPlan(bestPlan)
        };
    }

    initializePopulation(populationSize, days) {
        const population = [];
        const mealsPerDay = 3; // breakfast, lunch, dinner
        
        for (let i = 0; i < populationSize; i++) {
            const individual = [];
            for (let day = 0; day < days; day++) {
                const dayMeals = [];
                for (let meal = 0; meal < mealsPerDay; meal++) {
                    const randomRecipe = this.recipes[Math.floor(Math.random() * this.recipes.length)];
                    dayMeals.push(randomRecipe.id);
                }
                individual.push(dayMeals);
            }
            population.push(individual);
        }
        
        return population;
    }

    evaluateMealPlanFitness(mealPlan, preferences) {
        let fitness = 0;
        const dailyTargets = {
            calories: preferences.dailyCalories || 2000,
            protein: preferences.dailyProtein || 150,
            maxCost: preferences.budget || 50
        };
        
        mealPlan.forEach(dayMeals => {
            const dayNutrition = this.calculateDayNutrition(dayMeals);
            
            // Calorie proximity (penalty for being too far from target)
            const calorieDeviation = Math.abs(dayNutrition.calories - dailyTargets.calories);
            fitness += Math.max(0, 100 - calorieDeviation / 10);
            
            // Protein adequacy
            if (dayNutrition.protein >= dailyTargets.protein) {
                fitness += 50;
            } else {
                fitness += (dayNutrition.protein / dailyTargets.protein) * 50;
            }
            
            // Cost efficiency
            if (dayNutrition.cost <= dailyTargets.maxCost) {
                fitness += 30;
            } else {
                fitness -= (dayNutrition.cost - dailyTargets.maxCost) * 2;
            }
            
            // Variety bonus
            const uniqueRecipes = new Set(dayMeals).size;
            fitness += uniqueRecipes * 10;
        });
        
        // Weekly variety bonus
        const allRecipes = mealPlan.flat();
        const weeklyVariety = new Set(allRecipes).size;
        fitness += weeklyVariety * 5;
        
        return fitness;
    }

    calculateDayNutrition(dayMeals) {
        return dayMeals.reduce((totals, recipeId) => {
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                totals.calories += recipe.calories;
                totals.protein += recipe.protein;
                totals.carbs += recipe.carbs;
                totals.fat += recipe.fat;
                totals.cost += recipe.estimatedCost;
            }
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });
    }

    tournamentSelection(population, fitness, tournamentSize = 3) {
        let best = -1;
        let bestFitness = -Infinity;
        
        for (let i = 0; i < tournamentSize; i++) {
            const candidate = Math.floor(Math.random() * population.length);
            if (fitness[candidate] > bestFitness) {
                best = candidate;
                bestFitness = fitness[candidate];
            }
        }
        
        return population[best];
    }

    selectElite(population, fitness, eliteSize) {
        const indexed = fitness.map((fit, index) => ({ fitness: fit, index }));
        indexed.sort((a, b) => b.fitness - a.fitness);
        
        return indexed.slice(0, eliteSize).map(item => population[item.index]);
    }

    crossover(parent1, parent2) {
        const offspring = [];
        const crossoverPoint = Math.floor(Math.random() * parent1.length);
        
        for (let i = 0; i < parent1.length; i++) {
            if (i < crossoverPoint) {
                offspring.push([...parent1[i]]);
            } else {
                offspring.push([...parent2[i]]);
            }
        }
        
        return offspring;
    }

    mutate(individual) {
        const mutationPoint = Math.floor(Math.random() * individual.length);
        const mealIndex = Math.floor(Math.random() * individual[mutationPoint].length);
        const newRecipe = this.recipes[Math.floor(Math.random() * this.recipes.length)];
        
        individual[mutationPoint][mealIndex] = newRecipe.id;
    }

    formatMealPlan(mealPlan) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
        
        return mealPlan.map((dayMeals, dayIndex) => ({
            day: days[dayIndex],
            meals: dayMeals.map((recipeId, mealIndex) => {
                const recipe = this.recipes.find(r => r.id === recipeId);
                return {
                    type: mealTypes[mealIndex],
                    recipe: recipe
                };
            })
        }));
    }

    analyzeMealPlan(mealPlan) {
        const weekNutrition = mealPlan.reduce((totals, dayMeals) => {
            const dayNutrition = this.calculateDayNutrition(dayMeals);
            totals.calories += dayNutrition.calories;
            totals.protein += dayNutrition.protein;
            totals.carbs += dayNutrition.carbs;
            totals.fat += dayNutrition.fat;
            totals.cost += dayNutrition.cost;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });
        
        const uniqueRecipes = new Set(mealPlan.flat()).size;
        const totalRecipes = mealPlan.flat().length;
        
        return {
            weeklyTotals: weekNutrition,
            dailyAverages: {
                calories: Math.round(weekNutrition.calories / 7),
                protein: Math.round(weekNutrition.protein / 7),
                carbs: Math.round(weekNutrition.carbs / 7),
                fat: Math.round(weekNutrition.fat / 7),
                cost: Math.round(weekNutrition.cost / 7)
            },
            variety: {
                uniqueRecipes: uniqueRecipes,
                totalMeals: totalRecipes,
                varietyScore: uniqueRecipes / totalRecipes
            }
        };
    }

    // Train all models
    trainModels() {
        const startTime = performance.now();
        
        console.log('Training AI models...');
        
        // Train K-means clustering
        this.kMeansCluster(this.recipes);
        
        // Train nutrition prediction model
        const nutritionFeatures = this.recipes.map(r => [r.calories, r.protein, r.carbs, r.fat]);
        const satisfactionScores = this.recipes.map(r => 
            r.ratings.reduce((sum, rating) => sum + rating, 0) / r.ratings.length
        );
        
        this.nutritionModel = this.linearRegression(nutritionFeatures, satisfactionScores);
        
        const endTime = performance.now();
        this.performanceMetrics.overall.trainTime = endTime - startTime;
        
        console.log('AI models trained successfully');
        console.log('Performance metrics:', this.performanceMetrics);
        console.log(`Training completed in ${Math.round(endTime - startTime)}ms`);
    }

    // Main recommendation engine
    getRecommendations(userPreferences) {
        const startTime = performance.now();
        
        const results = {
            kmeansRecommendations: this.getKmeansRecommendations(userPreferences),
            collaborativeRecommendations: this.collaborativeFiltering(userPreferences),
            decisionTreeRecommendations: this.decisionTree(userPreferences),
            algorithmPerformance: this.performanceMetrics,
            processingTime: 0
        };
        
        const endTime = performance.now();
        results.processingTime = endTime - startTime;
        this.performanceMetrics.overall.predictions++;
        
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
        
        // Calorie compatibility
        if (char.avgCalories <= (userPreferences.maxCalories || 500)) {
            score += 30;
        } else {
            score -= Math.abs(char.avgCalories - (userPreferences.maxCalories || 500)) / 10;
        }
        
        // Protein adequacy
        if (char.avgProtein >= (userPreferences.minProtein || 15)) {
            score += 30;
        } else {
            score -= (userPreferences.minProtein || 15) - char.avgProtein;
        }
        
        // Time efficiency
        if (char.avgCookingTime <= (userPreferences.maxTime || 45)) {
            score += 40;
        } else {
            score -= (char.avgCookingTime - (userPreferences.maxTime || 45)) * 2;
        }
        
        // Rating bonus
        score += (char.avgRating - 3) * 10;
        
        return Math.max(0, score);
    }

    // Export performance metrics
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            datasetSize: {
                recipes: this.recipes.length,
                users: this.users.length,
                clusters: this.clusters.length
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize AI system
const recipeAI = new RecipeAI();

// Export for use in other files
window.RecipeAI = RecipeAI;
window.recipeAI = recipeAI;

console.log('Advanced AI algorithms loaded successfully');