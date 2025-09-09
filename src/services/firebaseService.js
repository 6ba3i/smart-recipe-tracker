/**
 * Firebase Database Service
 * 
 * Handles all Firebase Firestore operations for:
 * - Favorite recipes
 * - Meal plans
 * - Nutrition tracking
 * - User preferences
 * - AI predictions history
 */

import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

class FirebaseService {
  // ============================================================================
  // FAVORITE RECIPES
  // ============================================================================
  
  /**
   * Save a recipe to user's favorites
   */
  static async saveFavoriteRecipe(userId, recipe) {
    try {
      console.log('Saving favorite recipe for user:', userId);
      
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        recipeId: recipe.id,
        recipe: {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          summary: recipe.summary,
          sourceUrl: recipe.sourceUrl,
          spoonacularScore: recipe.spoonacularScore,
          healthScore: recipe.healthScore,
          dishTypes: recipe.dishTypes || [],
          cuisines: recipe.cuisines || [],
          diets: recipe.diets || [],
          nutrition: recipe.nutrition || null
        },
        createdAt: serverTimestamp(),
        tags: recipe.dishTypes || []
      });
      
      console.log('Favorite recipe saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving favorite recipe:', error);
      throw error;
    }
  }
  
  /**
   * Get all favorite recipes for a user
   */
  static async getFavoriteRecipes(userId) {
    try {
      console.log('Getting favorite recipes for user:', userId);
      
      const q = query(
        collection(db, 'favorites'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const favorites = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${favorites.length} favorite recipes`);
      return favorites;
    } catch (error) {
      console.error('Error getting favorite recipes:', error);
      throw error;
    }
  }
  
  /**
   * Remove a recipe from favorites
   */
  static async removeFavoriteRecipe(favoriteId) {
    try {
      console.log('Removing favorite recipe:', favoriteId);
      await deleteDoc(doc(db, 'favorites', favoriteId));
      console.log('Favorite recipe removed successfully');
    } catch (error) {
      console.error('Error removing favorite recipe:', error);
      throw error;
    }
  }
  
  /**
   * Check if recipe is in user's favorites
   */
  static async isRecipeFavorite(userId, recipeId) {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('recipeId', '==', recipeId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if recipe is favorite:', error);
      return false;
    }
  }
  
  // ============================================================================
  // MEAL PLANS
  // ============================================================================
  
  /**
   * Save a meal plan
   */
  static async saveMealPlan(userId, mealPlan) {
    try {
      console.log('Saving meal plan for user:', userId);
      
      const docRef = await addDoc(collection(db, 'mealPlans'), {
        userId,
        name: mealPlan.name,
        description: mealPlan.description,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate,
        meals: mealPlan.meals,
        nutritionGoals: mealPlan.nutritionGoals,
        totalNutrition: mealPlan.totalNutrition,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Meal plan saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  }
  
  /**
   * Get meal plans for a user
   */
  static async getMealPlans(userId) {
    try {
      console.log('Getting meal plans for user:', userId);
      
      const q = query(
        collection(db, 'mealPlans'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const mealPlans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${mealPlans.length} meal plans`);
      return mealPlans;
    } catch (error) {
      console.error('Error getting meal plans:', error);
      throw error;
    }
  }
  
  /**
   * Update a meal plan
   */
  static async updateMealPlan(mealPlanId, updates) {
    try {
      console.log('Updating meal plan:', mealPlanId);
      
      await updateDoc(doc(db, 'mealPlans', mealPlanId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Meal plan updated successfully');
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  }
  
  /**
   * Delete a meal plan
   */
  static async deleteMealPlan(mealPlanId) {
    try {
      console.log('Deleting meal plan:', mealPlanId);
      await deleteDoc(doc(db, 'mealPlans', mealPlanId));
      console.log('Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // NUTRITION TRACKING
  // ============================================================================
  
  /**
   * Save nutrition entry
   */
  static async saveNutritionEntry(userId, nutritionData) {
    try {
      console.log('Saving nutrition entry for user:', userId);
      
      const docRef = await addDoc(collection(db, 'nutritionEntries'), {
        userId,
        date: nutritionData.date,
        meals: nutritionData.meals,
        totalCalories: nutritionData.totalCalories,
        totalProtein: nutritionData.totalProtein,
        totalCarbs: nutritionData.totalCarbs,
        totalFat: nutritionData.totalFat,
        totalFiber: nutritionData.totalFiber,
        waterIntake: nutritionData.waterIntake || 0,
        exercise: nutritionData.exercise || [],
        notes: nutritionData.notes || '',
        createdAt: serverTimestamp()
      });
      
      console.log('Nutrition entry saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      throw error;
    }
  }
  
  /**
   * Get nutrition entries for a date range
   */
  static async getNutritionEntries(userId, startDate, endDate) {
    try {
      console.log('Getting nutrition entries for user:', userId);
      
      const q = query(
        collection(db, 'nutritionEntries'),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${entries.length} nutrition entries`);
      return entries;
    } catch (error) {
      console.error('Error getting nutrition entries:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // USER PREFERENCES
  // ============================================================================
  
  /**
   * Save user preferences
   */
  static async saveUserPreferences(userId, preferences) {
    try {
      console.log('Saving user preferences:', userId);
      
      const docRef = doc(db, 'userPreferences', userId);
      await updateDoc(docRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      });
      
      console.log('User preferences saved successfully');
    } catch (error) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        await addDoc(collection(db, 'userPreferences'), {
          userId,
          ...preferences,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        console.error('Error saving user preferences:', error);
        throw error;
      }
    }
  }
  
  /**
   * Get user preferences
   */
  static async getUserPreferences(userId) {
    try {
      console.log('Getting user preferences for:', userId);
      
      const docRef = doc(db, 'userPreferences', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No user preferences found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // AI PREDICTIONS HISTORY
  // ============================================================================
  
  /**
   * Save AI prediction result
   */
  static async saveAIPrediction(userId, predictionData) {
    try {
      console.log('Saving AI prediction for user:', userId);
      
      const docRef = await addDoc(collection(db, 'aiPredictions'), {
        userId,
        predictionType: predictionData.type,
        inputData: predictionData.input,
        result: predictionData.result,
        confidence: predictionData.confidence || 0,
        algorithm: predictionData.algorithm,
        metadata: predictionData.metadata || {},
        createdAt: serverTimestamp()
      });
      
      console.log('AI prediction saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving AI prediction:', error);
      throw error;
    }
  }
  
  /**
   * Get AI prediction history
   */
  static async getAIPredictions(userId, predictionType = null) {
    try {
      console.log('Getting AI predictions for user:', userId);
      
      let q;
      if (predictionType) {
        q = query(
          collection(db, 'aiPredictions'),
          where('userId', '==', userId),
          where('predictionType', '==', predictionType),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      } else {
        q = query(
          collection(db, 'aiPredictions'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const predictions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${predictions.length} AI predictions`);
      return predictions;
    } catch (error) {
      console.error('Error getting AI predictions:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    try {
      console.log('Getting user statistics for:', userId);
      
      const [favorites, mealPlans, nutritionEntries, predictions] = await Promise.all([
        this.getFavoriteRecipes(userId),
        this.getMealPlans(userId),
        this.getNutritionEntries(userId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        this.getAIPredictions(userId)
      ]);
      
      return {
        totalFavorites: favorites.length,
        totalMealPlans: mealPlans.length,
        recentNutritionEntries: nutritionEntries.length,
        totalPredictions: predictions.length,
        lastActivity: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }
  
  /**
   * Batch operations for data migration
   */
  static async batchOperation(operations) {
    try {
      console.log(`Executing ${operations.length} batch operations`);
      
      // Execute operations in batches of 10 to avoid Firestore limits
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
      }
      
      console.log('Batch operations completed successfully');
      return results;
    } catch (error) {
      console.error('Error in batch operations:', error);
      throw error;
    }
  }
}

export default FirebaseService;