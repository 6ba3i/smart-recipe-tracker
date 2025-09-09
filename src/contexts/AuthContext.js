import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, additionalData = {}) => {
    try {
      setError(null);
      const auth = getAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile if display name provided
      if (additionalData.displayName) {
        await updateProfile(result.user, {
          displayName: additionalData.displayName
        });
      }

      // Create user document in Firestore
      await createUserProfile(result.user, additionalData);
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      setError(null);
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in anonymously for demo purposes
  const signInAnon = async () => {
    try {
      setError(null);
      const auth = getAuth();
      const result = await signInAnonymously(auth);
      
      // Create anonymous user profile
      await createUserProfile(result.user, {
        displayName: 'Anonymous User',
        isAnonymous: true
      });
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      
      if (!currentUser) throw new Error('No user logged in');

      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(currentUser, {
          displayName: updates.displayName || currentUser.displayName,
          photoURL: updates.photoURL || currentUser.photoURL
        });
      }

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email, photoURL } = user;
        const createdAt = new Date().toISOString();

        const defaultProfile = {
          displayName: displayName || additionalData.displayName || 'User',
          email,
          photoURL: photoURL || null,
          createdAt,
          updatedAt: createdAt,
          isAnonymous: user.isAnonymous || false,
          preferences: {
            cuisinePreferences: [],
            dietaryRestrictions: [],
            allergies: [],
            cookingSkill: 'beginner',
            maxCookingTime: 60,
            budgetRange: 'medium',
            familySize: 1
          },
          nutritionGoals: {
            calories: 2000,
            protein: 100,
            carbohydrates: 250,
            fat: 67,
            fiber: 25,
            sodium: 2300
          },
          stats: {
            recipesViewed: 0,
            recipesCooked: 0,
            favoritesCount: 0,
            mealPlansCreated: 0,
            joinDate: createdAt
          },
          ...additionalData
        };

        await setDoc(userRef, defaultProfile);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Get user profile from Firestore
  const getUserProfile = async (userId = null) => {
    try {
      const uid = userId || currentUser?.uid;
      if (!uid) return null;

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Check if user exists by email
  const checkUserExists = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  // Auth state change listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Ensure user profile exists in Firestore
        await createUserProfile(user);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Clear error when user changes
  useEffect(() => {
    setError(null);
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    error,
    signup,
    signin,
    signInAnon,
    logout,
    resetPassword,
    updateUserProfile,
    getUserProfile,
    checkUserExists,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;