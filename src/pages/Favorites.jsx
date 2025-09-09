/**
 * Favorites Page
 * 
 * Features:
 * - Display user's favorite recipes
 * - Search and filter favorites
 * - Categories and tags
 * - Recipe cards with actions
 * - Bulk operations
 * - Export favorites
 * - Recipe collections/lists
 */

import React, { useState, useEffect } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { 
  Heart, 
  Search, 
  Download, 
  Trash2,
  Clock,
  Users,
  Star,
  ChefHat,
  BookOpen,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import { SpoonacularAPI } from '../services/spoonacularAPI';
import FirebaseService from '../services/firebaseService';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    favorites, 
    loadFavorites, 
    removeFromFavorites, 
    isRecipeFavorite 
  } = useRecipe();

  // Display state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filteredFavorites, setFilteredFavorites] = useState([]);  //   // 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded', 'title', 'cookTime', 'rating'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Collections state  //   // 
  const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());
  const [newCollectionName, setNewCollectionName] = useState('');

  // Recipe details modal
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // Bulk operations
  const [bulkMode, setBulkMode] = useState(false);

  // API instance
  const [api] = useState(() => new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY));

  useEffect(() => {
    if (isAuthenticated) {
      loadUserFavorites();
      loadCollections();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [favorites, searchQuery, selectedCategory, selectedCuisine, sortBy, sortOrder]);

  const loadUserFavorites = async () => {
    try {
      setLoading(true);
      await loadFavorites();
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Unable to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    if (!user?.uid) return;

    try {
      const userCollections = await FirebaseService.getRecipeCollections(user.uid);
      setCollections(userCollections || []);
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...favorites];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(query) ||
        (recipe.cuisines && recipe.cuisines.some(cuisine => cuisine.toLowerCase().includes(query))) ||
        (recipe.dishTypes && recipe.dishTypes.some(type => type.toLowerCase().includes(query)))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => 
        recipe.dishTypes && recipe.dishTypes.includes(selectedCategory)
      );
    }

    // Apply cuisine filter
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(recipe => 
        recipe.cuisines && recipe.cuisines.includes(selectedCuisine)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'cookTime':
          comparison = (a.readyInMinutes || 0) - (b.readyInMinutes || 0);
          break;
        case 'rating':
          comparison = (a.spoonacularScore || 0) - (b.spoonacularScore || 0);
          break;
        case 'dateAdded':
        default:
          comparison = new Date(a.addedAt || 0) - new Date(b.addedAt || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFavorites(filtered);
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

  const handleRemoveFavorite = async (recipe) => {
    if (window.confirm(`Remove "${recipe.title}" from favorites?`)) {
      try {
        await removeFromFavorites(recipe.id);
        setSelectedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipe.id);
          return newSet;
        });
      } catch (err) {
        console.error('Error removing favorite:', err);
        setError('Unable to remove from favorites.');
      }
    }
  };

  const handleBulkSelect = (recipeId) => {
    setSelectedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRecipes.size === filteredFavorites.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(filteredFavorites.map(recipe => recipe.id)));
    }
  };

  const handleBulkRemove = async () => {
    if (selectedRecipes.size === 0) return;
    
    if (window.confirm(`Remove ${selectedRecipes.size} recipes from favorites?`)) {
      try {
        for (const recipeId of selectedRecipes) {
          await removeFromFavorites(recipeId);
        }
        setSelectedRecipes(new Set());
        setBulkMode(false);
      } catch (err) {
        console.error('Error removing favorites:', err);
        setError('Unable to remove recipes from favorites.');
      }
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim() || selectedRecipes.size === 0) return;

    try {
      const collection = {
        name: newCollectionName.trim(),
        recipes: Array.from(selectedRecipes),
        createdAt: new Date().toISOString(),
        userId: user.uid
      };

      await FirebaseService.saveRecipeCollection(user.uid, collection);
      await loadCollections();
      
      setNewCollectionName('');
      setSelectedRecipes(new Set());
      setShowCollectionModal(false);
      setBulkMode(false);
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Unable to create collection.');
    }
  };

  const exportFavorites = () => {
    const exportData = {
      favorites: filteredFavorites,
      exportDate: new Date().toISOString(),
      totalRecipes: filteredFavorites.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorite-recipes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const getUniqueCategories = () => {
    const categories = new Set();
    favorites.forEach(recipe => {
      if (recipe.dishTypes) {
        recipe.dishTypes.forEach(type => categories.add(type));
      }
    });
    return Array.from(categories).sort();
  };

  const getUniqueCuisines = () => {
    const cuisines = new Set();
    favorites.forEach(recipe => {
      if (recipe.cuisines) {
        recipe.cuisines.forEach(cuisine => cuisines.add(cuisine));
      }
    });
    return Array.from(cuisines).sort();
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center">
        <h3>Please sign in to view your favorites</h3>
        <p className="text-muted">Your favorite recipes will be saved and synced across devices.</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">
              <Heart className="me-2 text-danger" />
              My Favorites
              {favorites.length > 0 && (
                <Badge bg="secondary" className="ms-2">{favorites.length}</Badge>
              )}
            </h1>
            <div className="d-flex gap-2">
              <ButtonGroup>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </Button>
              </ButtonGroup>
              
              <Button
                variant={bulkMode ? 'warning' : 'outline-secondary'}
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setSelectedRecipes(new Set());
                }}
              >
                Select Multiple
              </Button>
              
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary">
                  Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={exportFavorites}>
                    <Download size={16} className="me-2" />
                    Export Favorites
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={() => setShowCollectionModal(true)}
                    disabled={selectedRecipes.size === 0}
                  >
                    <BookOpen size={16} className="me-2" />
                    Create Collection
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Search Favorites</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, cuisine, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button variant="outline-secondary">
                        <Search size={18} />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Cuisine</Form.Label>
                    <Form.Select
                      value={selectedCuisine}
                      onChange={(e) => setSelectedCuisine(e.target.value)}
                    >
                      <option value="all">All Cuisines</option>
                      {getUniqueCuisines().map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="dateAdded">Date Added</option>
                      <option value="title">Name</option>
                      <option value="cookTime">Cooking Time</option>
                      <option value="rating">Rating</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Order</Form.Label>
                    <Form.Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Bulk Mode Controls */}
              {bulkMode && (
                <Row className="mt-3 pt-3 border-top">
                  <Col>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedRecipes.size === filteredFavorites.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        {selectedRecipes.size > 0 && (
                          <span className="ms-3 text-muted">
                            {selectedRecipes.size} recipe{selectedRecipes.size !== 1 ? 's' : ''} selected
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowCollectionModal(true)}
                          disabled={selectedRecipes.size === 0}
                        >
                          <BookOpen size={16} className="me-2" />
                          Create Collection
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleBulkRemove}
                          disabled={selectedRecipes.size === 0}
                        >
                          <Trash2 size={16} className="me-2" />
                          Remove Selected
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your favorites...</p>
        </div>
      )}

      {/* No Favorites State */}
      {!loading && favorites.length === 0 && (
        <Card className="text-center py-5">
          <Card.Body>
            <Heart size={64} className="text-muted mb-3" />
            <h4>No favorites yet</h4>
            <p className="text-muted">
              Start adding recipes to your favorites by clicking the heart icon on any recipe.
            </p>
            <Button variant="primary" href="/search">
              Browse Recipes
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* No Results State */}
      {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
        <Card className="text-center py-5">
          <Card.Body>
            <Search size={64} className="text-muted mb-3" />
            <h4>No recipes match your filters</h4>
            <p className="text-muted">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedCuisine('all');
              }}
            >
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Favorites Grid/List */}
      {!loading && filteredFavorites.length > 0 && (
        <Row>
          {viewMode === 'grid' ? (
            // Grid View
            filteredFavorites.map((recipe) => (
              <Col key={recipe.id} sm={6} md={4} lg={3} className="mb-4">
                <Card className="h-100 recipe-card position-relative">
                  {bulkMode && (
                    <Form.Check
                      type="checkbox"
                      className="position-absolute"
                      style={{ top: '10px', left: '10px', zIndex: 10 }}
                      checked={selectedRecipes.has(recipe.id)}
                      onChange={() => handleBulkSelect(recipe.id)}
                    />
                  )}
                  
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={recipe.image}
                      alt={recipe.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onClick={() => handleRecipeClick(recipe)}
                      className="cursor-pointer"
                    />
                    {!bulkMode && (
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(recipe);
                        }}
                      >
                        <Heart size={16} fill="red" color="red" />
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
                    
                    {recipe.cuisines && recipe.cuisines.length > 0 && (
                      <div className="mb-2">
                        {recipe.cuisines.slice(0, 2).map(cuisine => (
                          <Badge key={cuisine} bg="light" text="dark" className="me-1">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
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
            ))
          ) : (
            // List View
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {filteredFavorites.map((recipe, index) => (
                    <div 
                      key={recipe.id} 
                      className={`d-flex align-items-center p-3 ${index !== filteredFavorites.length - 1 ? 'border-bottom' : ''}`}
                    >
                      {bulkMode && (
                        <Form.Check
                          type="checkbox"
                          className="me-3"
                          checked={selectedRecipes.has(recipe.id)}
                          onChange={() => handleBulkSelect(recipe.id)}
                        />
                      )}
                      
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        className="rounded me-3 cursor-pointer"
                        onClick={() => handleRecipeClick(recipe)}
                      />
                      
                      <div className="flex-grow-1">
                        <h6 
                          className="mb-1 cursor-pointer"
                          onClick={() => handleRecipeClick(recipe)}
                        >
                          {recipe.title}
                        </h6>
                        
                        <div className="text-muted small mb-1">
                          <Clock size={12} className="me-1" />
                          {recipe.readyInMinutes || 'N/A'} min
                          <Users size={12} className="ms-3 me-1" />
                          {recipe.servings || 'N/A'} servings
                          {recipe.spoonacularScore && (
                            <>
                              <Star size={12} className="ms-3 me-1 text-warning" />
                              {Math.round(recipe.spoonacularScore)}/100
                            </>
                          )}
                        </div>
                        
                        {recipe.cuisines && recipe.cuisines.length > 0 && (
                          <div>
                            {recipe.cuisines.slice(0, 3).map(cuisine => (
                              <Badge key={cuisine} bg="light" text="dark" className="me-1">
                                {cuisine}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleRecipeClick(recipe)}
                        >
                          <ChefHat size={16} />
                        </Button>
                        {!bulkMode && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveFavorite(recipe)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}

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
          <Button variant="secondary" onClick={() => setShowRecipeModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Collection Modal */}
      <Modal 
        show={showCollectionModal} 
        onHide={() => setShowCollectionModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Recipe Collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Collection Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Quick Weeknight Dinners"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </Form.Group>
            <p className="text-muted">
              This collection will include {selectedRecipes.size} selected recipe{selectedRecipes.size !== 1 ? 's' : ''}.
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCollectionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={createCollection}
            disabled={!newCollectionName.trim() || selectedRecipes.size === 0}
          >
            Create Collection
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Favorites;