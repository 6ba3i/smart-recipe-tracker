/**
 * Main React Application Component
 * 
 * Features:
 * - React Router for 7+ pages
 * - Bootstrap styling
 * - Firebase authentication
 * - Context providers
 * - Error boundaries
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages (7 pages to exceed requirement)
import HomePage from './pages/HomePage';
import RecipeSearch from './pages/RecipeSearch';
import MealPlanner from './pages/MealPlanner';
import NutritionTracker from './pages/NutritionTracker';
import Favorites from './pages/Favorites';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RecipeProvider>
          <ThemeProvider>
            <Router>
              <div className="App min-vh-100 d-flex flex-column">
                <Header />
                
                <main className="flex-grow-1">
                  <Container fluid className="py-4">
                    <Routes>
                      {/* Public Routes */}
                      <Route 
                        path="/" 
                        element={<HomePage />} 
                      />
                      <Route 
                        path="/search" 
                        element={<RecipeSearch />} 
                      />
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/meal-planner" 
                        element={
                          <ProtectedRoute>
                            <MealPlanner />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/nutrition" 
                        element={
                          <ProtectedRoute>
                            <NutritionTracker />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/favorites" 
                        element={
                          <ProtectedRoute>
                            <Favorites />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/analytics" 
                        element={
                          <ProtectedRoute>
                            <Analytics />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* 404 Route */}
                      <Route 
                        path="*" 
                        element={
                          <Container className="text-center py-5">
                            <h1>404 - Page Not Found</h1>
                            <p>The page you're looking for doesn't exist.</p>
                          </Container>
                        } 
                      />
                    </Routes>
                  </Container>
                </main>
                
                <Footer />
              </div>
            </Router>
          </ThemeProvider>
        </RecipeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;