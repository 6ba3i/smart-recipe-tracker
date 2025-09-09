/**
 * Recipe Search & Discovery Page
 * 
 * Features:
 * - Advanced recipe search with filters
 * - Spoonacular API integration
 * - Search history and suggestions
 * - Recipe cards with favorites
 * - Pagination and sorting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Badge, 
  Alert,
  Spinner,
  Modal,
  Accordion,
  ButtonGroup,
  Pagination
} from 'react-bootstrap';
import { Search, Heart, Clock, Users, Star, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import { SpoonacularAPI } from '../services/spoonacularAPI';

const RecipeSearch = () => {
  const { isAuthenticated } = useAuth();
  const { addToFavorites, isRecipeFavorite, searchHistory, addToSearchHistory } = useRecipe();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(12);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    intolerances: [],
    maxReadyTime: '',
    minProtein: '',
    maxCalories: '',
    sort: 'popularity'
  });

  // API instance
  const [api] = useState(() => new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY));

  // Recipe details modal
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // Search suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load popular recipes on mount
    loadPopularRecipes();
  }, []);

  useEffect(() => {
    // Generate search suggestions based on query
    if (searchQuery.length >= 2) {
      generateSuggestions(searchQuery);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const loadPopularRecipes = async () => {
    try {
      setLoading(true);
      const results = await api.searchRecipes({
        query: '',
        number: resultsPerPage,
        sort: 'popularity',
        offset: 0
      });
      
      setSearchResults(results.results || []);
      setTotalResults(results.totalResults || 0);
    } catch (err) {
      console.error('Error loading popular recipes:', err);
      setError('Unable to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = useCallback(async (query) => {
    try {
      const suggestions = await api.autocompleteRecipeSearch(query, 5);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setSuggestions([]);
    }
  }, [api]);

  const handleSearch = async (page = 1, useCurrentQuery = true) => {
    const query = useCurrentQuery ? searchQuery : '';
    
    if (!query.trim() && page === 1) {
      loadPopularRecipes();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        query: query.trim(),
        number: resultsPerPage,
        offset: (page - 1) * resultsPerPage,
        sort: filters.sort,
        ...filters
      };

      // Remove empty filters
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || (Array.isArray(searchParams[key]) && searchParams[key].length === 0)) {
          delete searchParams[key];
        }
      });

      console.log('Searching with params:', searchParams);
      
      const results = await api.searchRecipes(searchParams);
      
      setSearchResults(results.results || []);
      setTotalResults(results.totalResults || 0);
      setCurrentPage(page);
      
      // Add to search history
      if (query.trim() && isAuthenticated) {
        addToSearchHistory(query.trim());
      }
      
      setShowSuggestions(false);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      diet: '',
      intolerances: [],
      maxReadyTime: '',
      minProtein: '',
      maxCalories: '',
      sort: 'popularity'
    });
  };

  const handleRecipeClick = async (recipe) => {
    try {
      const detailedRecipe = await api.getRecipeDetails(recipe.id);
      setSelectedRecipe(detailedRecipe);
      setShowRecipeModal(true);
    } catch (err) {
      console.error('Error loading recipe details:', err);
      setError('Unable to load recipe details.');
    }
  };

  const handleFavoriteToggle = async (recipe) => {
    if (!isAuthenticated) {
      setError('Please sign in to save favorites.');
      return;
    }
    
    try {
      await addToFavorites(recipe);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Unable to save favorite.');
    }
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Recipe Search</h1>
                <Button 
                  variant="outline-primary" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} className="me-2" />
                  Filters
                </Button>
              </div>

              {/* Search Bar */}
              <div className="position-relative mb-3">
                <Form.Group>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Search for recipes... (e.g., chicken pasta, vegetarian soup)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      variant="primary" 
                      onClick={() => handleSearch()}
                      disabled={loading}
                    >
                      {loading ? <Spinner as="span" animation="border" size="sm" /> : <Search size={18} />}
                    </Button>
                  </div>
                </Form.Group>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                    <Card.Body className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="py-2 px-2 cursor-pointer hover-bg-light"
                          onClick={() => {
                            setSearchQuery(suggestion.title);
                            setShowSuggestions(false);
                            handleSearch();
                          }}
                        >
                          {suggestion.title}
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <Accordion className="mb-3">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Advanced Filters</Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Cuisine</Form.Label>
                            <Form.Select
                              value={filters.cuisine}
                              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                            >
                              <option value="">Any Cuisine</option>
                              <option value="italian">Italian</option>
                              <option value="mexican">Mexican</option>
                              <option value="asian">Asian</option>
                              <option value="mediterranean">Mediterranean</option>
                              <option value="american">American</option>
                              <option value="indian">Indian</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Diet</Form.Label>
                            <Form.Select
                              value={filters.diet}
                              onChange={(e) => handleFilterChange('diet', e.target.value)}
                            >
                              <option value="">Any Diet</option>
                              <option value="vegetarian">Vegetarian</option>
                              <option value="vegan">Vegan</option>
                              <option value="ketogenic">Keto</option>
                              <option value="paleo">Paleo</option>
                              <option value="gluten free">Gluten Free</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Max Cooking Time (minutes)</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="e.g., 30"
                              value={filters.maxReadyTime}
                              onChange={(e) => handleFilterChange('maxReadyTime', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Sort By</Form.Label>
                            <Form.Select
                              value={filters.sort}
                              onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                              <option value="popularity">Popularity</option>
                              <option value="healthiness">Healthiness</option>
                              <option value="time">Cooking Time</option>
                              <option value="random">Random</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => handleSearch()}>
                          Apply Filters
                        </Button>
                        <Button variant="outline-secondary" onClick={clearFilters}>
                          Clear All
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )}

              {/* Search History */}
              {isAuthenticated && searchHistory.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted">Recent searches:</small>
                  <div className="mt-1">
                    {searchHistory.slice(0, 5).map((term, index) => (
                      <Badge
                        key={index}
                        bg="light"
                        text="dark"
                        className="me-2 mb-2 cursor-pointer"
                        onClick={() => {
                          setSearchQuery(term);
                          handleSearch();
                        }}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Recipes'} 
              {totalResults > 0 && (
                <small className="text-muted ms-2">({totalResults} recipes found)</small>
              )}
            </h5>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Searching for delicious recipes...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <h5>No recipes found</h5>
                <p className="text-muted">Try adjusting your search terms or filters</p>
                <Button variant="primary" onClick={loadPopularRecipes}>
                  Browse Popular Recipes
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              {/* Recipe Grid */}
              <Row>
                {searchResults.map((recipe) => (
                  <Col key={recipe.id} sm={6} md={4} lg={3} className="mb-4">
                    <Card className="h-100 recipe-card">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={recipe.image}
                          alt={recipe.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                          onClick={() => handleRecipeClick(recipe)}
                          className="cursor-pointer"
                        />
                        {isAuthenticated && (
                          <Button
                            variant="light"
                            size="sm"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(recipe);
                            }}
                          >
                            <Heart 
                              size={16} 
                              fill={isRecipeFavorite(recipe.id) ? 'red' : 'none'}
                              color={isRecipeFavorite(recipe.id) ? 'red' : 'currentColor'}
                            />
                          </Button>
                        )}
                      </div>
                      
                      <Card.Body className="d-flex flex-column">
                        <Card.Title 
                          className="h6 cursor-pointer"
                          onClick={() => handleRecipeClick(recipe)}
                        >
                          {recipe.title}
                        </Card.Title>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between text-muted small mb-2">
                            <span>
                              <Clock size={14} className="me-1" />
                              {recipe.readyInMinutes || 'N/A'} min
                            </span>
                            <span>
                              <Users size={14} className="me-1" />
                              {recipe.servings || 'N/A'} servings
                            </span>
                          </div>
                          
                          {recipe.spoonacularScore && (
                            <div className="d-flex align-items-center mb-2">
                              <Star size={14} className="text-warning me-1" />
                              <small>{Math.round(recipe.spoonacularScore)}/100</small>
                            </div>
                          )}
                          
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="w-100"
                            onClick={() => handleRecipeClick(recipe)}
                          >
                            View Recipe
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handleSearch(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handleSearch(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = Math.max(1, currentPage - 2) + index;
                      if (page <= totalPages) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => handleSearch(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}
                    
                    <Pagination.Next 
                      onClick={() => handleSearch(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handleSearch(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Recipe Details Modal */}
      <Modal 
        show={showRecipeModal} 
        onHide={() => setShowRecipeModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedRecipe?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecipe && (
            <div>
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title}
                className="w-100 mb-3"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
              
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Ready in:</strong> {selectedRecipe.readyInMinutes} minutes
                </Col>
                <Col md={4}>
                  <strong>Servings:</strong> {selectedRecipe.servings}
                </Col>
                <Col md={4}>
                  <strong>Score:</strong> {Math.round(selectedRecipe.spoonacularScore || 0)}/100
                </Col>
              </Row>

              <h6>Instructions:</h6>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: selectedRecipe.instructions || 'No instructions available.' 
                }}
              />
              
              {selectedRecipe.extendedIngredients && (
                <div className="mt-3">
                  <h6>Ingredients:</h6>
                  <ul>
                    {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient.original}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isAuthenticated && selectedRecipe && (
            <Button 
              variant="primary"
              onClick={() => handleFavoriteToggle(selectedRecipe)}
            >
              <Heart 
                size={16} 
                className="me-2"
                fill={isRecipeFavorite(selectedRecipe.id) ? 'white' : 'none'}
              />
              {isRecipeFavorite(selectedRecipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowRecipeModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecipeSearch;