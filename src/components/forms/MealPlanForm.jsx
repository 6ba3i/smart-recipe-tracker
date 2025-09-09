import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Button, 
  Row, 
  Col, 
  Card,
  Alert,
  Badge,
  ListGroup
} from 'react-bootstrap';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { SpoonacularAPI } from '../../services/spoonacularAPI';

const MealPlanForm = ({ 
  show, 
  onHide, 
  onSubmit, 
  selectedDate,
  initialData = null,
  loading = false 
}) => {
  const { user } = useAuth();
  const { favorites } = useRecipe();
  
  const [mealPlan, setMealPlan] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');

  const api = new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY);

  useEffect(() => {
    if (initialData) {
      setMealPlan(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (searchQuery.trim() && activeTab === 'search') {
      const timeoutId = setTimeout(() => {
        searchRecipes(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab]);

  const searchRecipes = async (query) => {
    try {
      setSearchLoading(true);
      const results = await api.searchRecipes({
        query: query.trim(),
        number: 12
      });
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Recipe search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addRecipeToMeal = (recipe, mealType) => {
    setMealPlan(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings
      }]
    }));
  };

  const removeRecipeFromMeal = (mealType, recipeIndex) => {
    setMealPlan(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, index) => index !== recipeIndex)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(mealPlan);
  };

  const getTotalRecipes = () => {
    return Object.values(mealPlan).reduce((total, meals) => total + meals.length, 0);
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <Calendar className="me-2" />
          Plan Meals for {selectedDate?.toLocaleDateString()}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row>
          {/* Recipe Selection Panel */}
          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Add Recipes</h6>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className={`btn ${activeTab === 'search' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setActiveTab('search')}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setActiveTab('favorites')}
                    >
                      Favorites
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {activeTab === 'search' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Search for recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </Form.Group>

                    {searchLoading && (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" />
                        <p className="mt-2 small text-muted">Searching...</p>
                      </div>
                    )}

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {searchResults.map(recipe => (
                        <Card key={recipe.id} className="mb-2">
                          <Card.Body className="p-2">
                            <div className="d-flex">
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                className="rounded me-3"
                              />
                              <div className="flex-grow-1">
                                <h6 className="mb-1 small">{recipe.title}</h6>
                                <small className="text-muted">
                                  {recipe.readyInMinutes || 'N/A'} min • {recipe.servings || 'N/A'} servings
                                </small>
                                <div className="mt-1">
                                  <Form.Select
                                    size="sm"
                                    value={selectedMealType}
                                    onChange={(e) => setSelectedMealType(e.target.value)}
                                    style={{ width: '120px', display: 'inline-block' }}
                                  >
                                    {mealTypes.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </Form.Select>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => addRecipeToMeal(recipe, selectedMealType)}
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'favorites' && (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {favorites.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted">No favorite recipes yet.</p>
                      </div>
                    ) : (
                      favorites.map(recipe => (
                        <Card key={recipe.id} className="mb-2">
                          <Card.Body className="p-2">
                            <div className="d-flex">
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                className="rounded me-3"
                              />
                              <div className="flex-grow-1">
                                <h6 className="mb-1 small">{recipe.title}</h6>
                                <small className="text-muted">
                                  {recipe.readyInMinutes || 'N/A'} min • {recipe.servings || 'N/A'} servings
                                </small>
                                <div className="mt-1">
                                  <Form.Select
                                    size="sm"
                                    value={selectedMealType}
                                    onChange={(e) => setSelectedMealType(e.target.value)}
                                    style={{ width: '120px', display: 'inline-block' }}
                                  >
                                    {mealTypes.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </Form.Select>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => addRecipeToMeal(recipe, selectedMealType)}
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Meal Plan Preview */}
          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">
                  Planned Meals 
                  <Badge bg="secondary" className="ms-2">{getTotalRecipes()} recipes</Badge>
                </h6>
              </Card.Header>
              <Card.Body>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {mealTypes.map(mealType => (
                    <div key={mealType} className="mb-3">
                      <h6 className="text-primary mb-2">{mealType}</h6>
                      {mealPlan[mealType].length === 0 ? (
                        <p className="text-muted small">No recipes planned</p>
                      ) : (
                        <ListGroup variant="flush">
                          {mealPlan[mealType].map((recipe, index) => (
                            <ListGroup.Item key={index} className="px-0 py-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <small className="fw-bold">{recipe.title}</small>
                                  <br />
                                  <small className="text-muted">
                                    {recipe.readyInMinutes || 'N/A'} min • {recipe.servings || 'N/A'} servings
                                  </small>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => removeRecipeFromMeal(mealType, index)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || getTotalRecipes() === 0}
        >
          {loading ? 'Saving...' : 'Save Meal Plan'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MealPlanForm;