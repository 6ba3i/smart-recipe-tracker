/**
 * HomePage - Dashboard with Bootstrap Design
 * 
 * Features:
 * - Bootstrap responsive design
 * - Personal recipe recommendations
 * - Quick stats and analytics preview
 * - Recent activity
 * - Quick actions
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Carousel,
  Alert,
  Modal,
  Form
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import { SpoonacularAPI } from '../services/spoonacularAPI';
import RecipeAI from '../services/aiAlgorithms';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    favorites, 
    mealPlans, 
    loadUserData,
    addToFavorites,
    isRecipeFavorite 
  } = useRecipe();

  // State
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [personalizedRecipes, setPersonalizedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // API instance
  const [api] = useState(() => new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY));

  useEffect(() => {
    loadHomePageData();
    
    // Show welcome modal for new users
    if (isAuthenticated && !localStorage.getItem('welcomeShown')) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [isAuthenticated]);

  const loadHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load featured recipes (popular/trending)
      const featured = await api.getRandomRecipes({
        number: 6,
        includeTags: ['popular', 'healthy']
      });
      setFeaturedRecipes(featured);

      // Load personalized recommendations if user is logged in
      if (isAuthenticated && user?.uid) {
        const personalized = await RecipeAI.recommendRecipes(
          user.uid,
          { cuisines: ['mediterranean', 'asian'], maxReadyTime: 45 },
          { calories: 400, protein: 20 },
          8
        );
        setPersonalizedRecipes(personalized);
      }

    } catch (err) {
      console.error('Error loading homepage data:', err);
      setError('Unable to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearchQuery.trim())}`);
    }
  };

  const handleRecipeClick = (recipe) => {
    // In a real app, this would navigate to recipe details
    console.log('Recipe clicked:', recipe.title);
  };

  const renderRecipeCard = (recipe, showActions = true) => (
    <Card key={recipe.id} className="h-100 recipe-card">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={recipe.image || `https://img.spoonacular.com/recipes/${recipe.id}-312x231.jpg`}
          alt={recipe.title}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/312x231?text=Recipe+Image';
          }}
        />
        {recipe.vegan && (
          <Badge bg="success" className="position-absolute top-0 end-0 m-2">
            Vegan
          </Badge>
        )}
        {recipe.readyInMinutes <= 30 && (
          <Badge bg="warning" className="position-absolute top-0 start-0 m-2">
            Quick
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 text-truncate" title={recipe.title}>
          {recipe.title}
        </Card.Title>
        
        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>
            <i className="fas fa-clock me-1"></i>
            {recipe.readyInMinutes || 'N/A'} min
          </span>
          <span>
            <i className="fas fa-users me-1"></i>
            {recipe.servings || 'N/A'} servings
          </span>
          {recipe.spoonacularScore && (
            <span>
              <i className="fas fa-star text-warning me-1"></i>
              {Math.round(recipe.spoonacularScore)}
            </span>
          )}
        </div>

        {recipe.dishTypes && recipe.dishTypes.length > 0 && (
          <div className="mb-2">
            {recipe.dishTypes.slice(0, 2).map((type, index) => (
              <Badge key={index} bg="light" text="dark" className="me-1 small">
                {type}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto">
          {showActions && (
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="flex-grow-1"
                onClick={() => handleRecipeClick(recipe)}
              >
                View Recipe
              </Button>
              {isAuthenticated && (
                <Button 
                  variant={isRecipeFavorite(recipe.id) ? "danger" : "outline-danger"} 
                  size="sm"
                  onClick={() => addToFavorites(recipe)}
                  disabled={isRecipeFavorite(recipe.id)}
                >
                  <i className="fas fa-heart"></i>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const renderQuickStats = () => (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3">
        <Card className="text-center h-100 border-primary">
          <Card.Body>
            <i className="fas fa-heart fa-2x text-primary mb-2"></i>
            <h4 className="text-primary">{favorites.length}</h4>
            <small className="text-muted">Saved Recipes</small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="text-center h-100 border-success">
          <Card.Body>
            <i className="fas fa-calendar-alt fa-2x text-success mb-2"></i>
            <h4 className="text-success">{mealPlans.length}</h4>
            <small className="text-muted">Meal Plans</small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="text-center h-100 border-info">
          <Card.Body>
            <i className="fas fa-chart-line fa-2x text-info mb-2"></i>
            <h4 className="text-info">85%</h4>
            <small className="text-muted">Health Score</small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="text-center h-100 border-warning">
          <Card.Body>
            <i className="fas fa-fire fa-2x text-warning mb-2"></i>
            <h4 className="text-warning">12</h4>
            <small className="text-muted">Day Streak</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading delicious recipes...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Welcome Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center py-5 bg-primary text-white rounded">
            <h1 className="display-4 fw-bold mb-3">
              {isAuthenticated ? `Welcome back, ${user?.displayName || 'Chef'}!` : 'Discover Amazing Recipes'}
            </h1>
            <p className="lead mb-4">
              {isAuthenticated 
                ? 'Your personalized recipe recommendations are ready'
                : 'Find recipes, plan meals, and track nutrition with AI-powered insights'
              }
            </p>
            
            {/* Quick Search */}
            <Form onSubmit={handleQuickSearch} className="d-flex justify-content-center">
              <div className="input-group" style={{ maxWidth: '500px' }}>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search for recipes..."
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="light" size="lg">
                  <i className="fas fa-search"></i>
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>

      {/* Quick Stats for authenticated users */}
      {isAuthenticated && renderQuickStats()}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Personalized Recommendations for logged-in users */}
      {isAuthenticated && personalizedRecipes.length > 0 && (
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h3">
                <i className="fas fa-magic text-primary me-2"></i>
                AI Recommendations for You
              </h2>
              <Link to="/analytics" className="btn btn-outline-primary">
                View All Analytics
              </Link>
            </div>
            
            <Row>
              {personalizedRecipes.slice(0, 4).map(recipe => (
                <Col lg={3} md={6} className="mb-4" key={recipe.id}>
                  {renderRecipeCard(recipe)}
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Featured Recipes Carousel */}
      <Row className="mb-5">
        <Col>
          <h2 className="h3 mb-3">
            <i className="fas fa-star text-warning me-2"></i>
            Featured Recipes
          </h2>
          
          {featuredRecipes.length > 0 ? (
            <Carousel indicators={false} className="recipe-carousel">
              {Array.from({ length: Math.ceil(featuredRecipes.length / 3) }, (_, slideIndex) => (
                <Carousel.Item key={slideIndex}>
                  <Row>
                    {featuredRecipes.slice(slideIndex * 3, (slideIndex + 1) * 3).map(recipe => (
                      <Col md={4} className="mb-3" key={recipe.id}>
                        {renderRecipeCard(recipe)}
                      </Col>
                    ))}
                  </Row>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
              <p className="text-muted">No featured recipes available</p>
            </div>
          )}
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-5">
        <Col>
          <h2 className="h3 mb-3">
            <i className="fas fa-bolt text-success me-2"></i>
            Quick Actions
          </h2>
          
          <Row>
            <Col lg={3} md={6} className="mb-3">
              <Card className="text-center h-100 quick-action-card">
                <Card.Body>
                  <i className="fas fa-search fa-3x text-primary mb-3"></i>
                  <h5>Find Recipes</h5>
                  <p className="text-muted">Search thousands of recipes</p>
                  <Link to="/search" className="btn btn-primary">
                    Start Searching
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card className="text-center h-100 quick-action-card">
                <Card.Body>
                  <i className="fas fa-calendar-plus fa-3x text-success mb-3"></i>
                  <h5>Plan Meals</h5>
                  <p className="text-muted">Create weekly meal plans</p>
                  <Link to="/meal-planner" className="btn btn-success">
                    Plan Meals
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card className="text-center h-100 quick-action-card">
                <Card.Body>
                  <i className="fas fa-chart-pie fa-3x text-info mb-3"></i>
                  <h5>Track Nutrition</h5>
                  <p className="text-muted">Monitor your daily nutrition</p>
                  <Link to="/nutrition" className="btn btn-info">
                    Track Now
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card className="text-center h-100 quick-action-card">
                <Card.Body>
                  <i className="fas fa-heart fa-3x text-danger mb-3"></i>
                  <h5>My Favorites</h5>
                  <p className="text-muted">View saved recipes</p>
                  <Link to="/favorites" className="btn btn-danger">
                    View Favorites
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Call to Action for non-authenticated users */}
      {!isAuthenticated && (
        <Row>
          <Col>
            <Card className="text-center bg-light">
              <Card.Body className="py-5">
                <h3 className="mb-3">Join Our Community</h3>
                <p className="text-muted mb-4">
                  Sign up to save favorites, create meal plans, and get personalized AI recommendations
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
                    Sign Up Free
                  </Button>
                  <Button variant="outline-primary" size="lg" onClick={() => navigate('/auth?mode=signin')}>
                    Sign In
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Welcome Modal for new users */}
      <Modal show={showWelcomeModal} onHide={() => setShowWelcomeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Welcome to Recipe Finder!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-utensils fa-4x text-primary mb-3"></i>
            <h5>You're all set!</h5>
            <p>
              Explore thousands of recipes, create meal plans, and get AI-powered 
              nutrition recommendations tailored just for you.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowWelcomeModal(false)}>
            Let's Get Cooking!
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HomePage;