import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Card className="border-0 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
            <Card.Body className="p-5">
              <Lock size={64} className="text-primary mb-4" />
              <h3 className="mb-3">Authentication Required</h3>
              <p className="text-muted mb-4">
                You need to sign in to access this page. Please log in to continue.
              </p>
              
              <Alert variant="info" className="mb-4">
                <strong>Why sign in?</strong><br />
                Access your saved recipes, meal plans, and personalized recommendations.
              </Alert>

              <div className="d-flex gap-2 justify-content-center">
                <Button 
                  variant="primary"
                  href={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                >
                  <LogIn size={16} className="me-2" />
                  Sign In
                </Button>
                <Button 
                  variant="outline-primary"
                  href={`/signup?redirect=${encodeURIComponent(location.pathname)}`}
                >
                  <UserPlus size={16} className="me-2" />
                  Sign Up
                </Button>
              </div>

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  Don't have an account? 
                  <a href="/signup" className="text-decoration-none ms-1">
                    Create one for free
                  </a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
