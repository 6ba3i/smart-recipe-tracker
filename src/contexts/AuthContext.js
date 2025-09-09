/**
 * Firebase Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Integrates with your existing Firebase auth setup
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid || 'no user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      console.log('Creating user account:', email);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
      
      console.log('User account created successfully');
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Signing in user:', email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      console.log('Signing in with Google');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful');
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      console.log('Signing out user');
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      console.log('Updating user profile:', updates);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completion.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const value = {
    // State
    user,
    loading,
    error,
    
    // Methods
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    clearError,
    
    // User info helpers
    isAuthenticated: !!user,
    userDisplayName: user?.displayName || user?.email || 'User',
    userEmail: user?.email,
    userId: user?.uid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};