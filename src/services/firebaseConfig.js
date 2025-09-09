import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using Create React App environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC_fnBK0vfP3U6SKhFWJP98CC6e2sjjIJs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "nut-track.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "nut-track",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "nut-track.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "656967210072",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:656967210072:web:5f17fc3d10e525e08ee62d",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-CVLLBVRBEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production and if measurementId exists)
let analytics;
if (typeof window !== 'undefined' && firebaseConfig.measurementId && process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics not available:', error);
  }
}
export { analytics };

// Export the app instance
export default app;

// Helper service functions for common Firebase operations
export const FirebaseService = {
  // User management
  async createUser(userId, userData) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async updateUser(userId, updates) {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};