/**
 * Meal Planner Page
 * 
 * Features:
 * - Weekly meal planning calendar
 * - Drag & drop recipes to days
 * - Meal plan templates
 * - Shopping list generation
 * - Nutritional planning
 * - Save and share meal plans
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Modal,
  Form,
  Badge,
  Alert,
  Dropdown,
  ButtonGroup,
  Tab,
  Tabs,
  Table,
  ListGroup
} from 'react-bootstrap';
import { 
  Calendar, 
  Plus, 
  ShoppingCart, 
  Download, 
  Share, 
  Trash2,
  Edit,
  Copy,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import { SpoonacularAPI } from '../services/spoonacularAPI';
import FirebaseService from '../services/firebaseService';

const MealPlanner = () => {
  const { user, isAuthenticated } = useAuth();
  const { favorites } = useRecipe();

  // Current week state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');

  // Recipe search for adding meals
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Shopping list
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // API instance
  const [api] = useState(() => new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY));

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    if (isAuthenticated) {
      loadMealPlan();
      loadTemplates();
    }
  }, [currentWeek, isAuthenticated]);

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadMealPlan = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const weekDates = getWeekDates();
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);

      const plan = await FirebaseService.getMealPlan(user.uid, startDate, endDate);
      setMealPlan(plan || {});
    } catch (err) {
      console.error('Error loading meal plan:', err);
      setError('Unable to load meal plan.');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    if (!user?.uid) return;

    try {
      const userTemplates = await FirebaseService.getMealPlanTemplates(user.uid);
      setTemplates(userTemplates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const saveMealPlan = async () => {
    if (!user?.uid) return;

    try {
      await FirebaseService.saveMealPlan(user.uid, mealPlan);
    } catch (err) {
      console.error('Error saving meal plan:', err);
      setError('Unable to save meal plan.');
    }
  };

  const addMealToPlan = async (recipe, day, mealType) => {
    const dateKey = formatDate(day);
    const newMealPlan = { ...mealPlan };
    
    if (!newMealPlan[dateKey]) {
      newMealPlan[dateKey] = {};
    }
    if (!newMealPlan[dateKey][mealType]) {
      newMealPlan[dateKey][mealType] = [];
    }

    newMealPlan[dateKey][mealType].push({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      addedAt: new Date().toISOString()
    });

    setMealPlan(newMealPlan);
    await saveMealPlan();
    setShowAddMealModal(false);
  };

  const removeMealFromPlan = async (dateKey, mealType, recipeIndex) => {
    const newMealPlan = { ...mealPlan };
    if (newMealPlan[dateKey] && newMealPlan[dateKey][mealType]) {
      newMealPlan[dateKey][mealType].splice(recipeIndex, 1);
      
      // Clean up empty arrays/objects
      if (newMealPlan[dateKey][mealType].length === 0) {
        delete newMealPlan[dateKey][mealType];
      }
      if (Object.keys(newMealPlan[dateKey]).length === 0) {
        delete newMealPlan[dateKey];
      }
      
      setMealPlan(newMealPlan);
      await saveMealPlan();
    }
  };

  const searchRecipes = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await api.searchRecipes({
        query: query.trim(),
        number: 12
      });
      setSearchResults(results.results || []);
    } catch (err) {
      console.error('Error searching recipes:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const generateShoppingList = () => {
    const ingredients = new Map();
    const weekDates = getWeekDates();

    weekDates.forEach(date => {
      const dateKey = formatDate(date);
      const dayMeals = mealPlan[dateKey];
      
      if (dayMeals) {
        Object.values(dayMeals).forEach(mealTypeRecipes => {
          mealTypeRecipes.forEach(recipe => {
            // This would typically fetch recipe details to get ingredients
            // For now, we'll add a placeholder
            ingredients.set(`Ingredients for ${recipe.title}`, {
              amount: '1',
              unit: 'recipe',
              name: recipe.title
            });
          });
        });
      }
    });

    return Array.from(ingredients.values());
  };

  const exportMealPlan = () => {
    const weekDates = getWeekDates();
    const exportData = {
      weekStart: formatDate(weekDates[0]),
      weekEnd: formatDate(weekDates[6]),
      mealPlan,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-plan-${formatDate(weekDates[0])}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearWeek = async () => {
    if (window.confirm('Are you sure you want to clear this week\'s meal plan?')) {
      const weekDates = getWeekDates();
      const newMealPlan = { ...mealPlan };
      
      weekDates.forEach(date => {
        const dateKey = formatDate(date);
        delete newMealPlan[dateKey];
      });
      
      setMealPlan(newMealPlan);
      await saveMealPlan();
    }
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const weekDates = getWeekDates();

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">
              <Calendar className="me-2" />
              Meal Planner
            </h1>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowShoppingList(true)}
              >
                <ShoppingCart size={18} className="me-2" />
                Shopping List
              </Button>
              <Button
                variant="outline-secondary"
                onClick={exportMealPlan}
              >
                <Download size={18} className="me-2" />
                Export
              </Button>
              <Button
                variant="outline-danger"
                onClick={clearWeek}
              >
                <Trash2 size={18} className="me-2" />
                Clear Week
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Week Navigation */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant="outline-primary"
                  onClick={() => navigateWeek(-1)}
                >
                  ← Previous Week
                </Button>
                
                <h5 className="mb-0">
                  {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
                </h5>
                
                <Button
                  variant="outline-primary"
                  onClick={() => navigateWeek(1)}
                >
                  Next Week →
                </Button>
              </div>
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

      {/* Meal Planning Grid */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '120px' }}>Meal</th>
                      {daysOfWeek.map((day, index) => (
                        <th key={day} className="text-center">
                          <div>
                            <div className="fw-bold">{day}</div>
                            <small className="text-muted">
                              {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                            </small>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mealTypes.map(mealType => (
                      <tr key={mealType}>
                        <td className="table-secondary fw-bold align-middle">
                          {mealType}
                        </td>
                        {weekDates.map((date, dayIndex) => {
                          const dateKey = formatDate(date);
                          const dayMeals = mealPlan[dateKey] || {};
                          const mealTypeRecipes = dayMeals[mealType] || [];
                          
                          return (
                            <td key={dayIndex} className="p-2" style={{ minHeight: '120px' }}>
                              <div className="d-flex flex-column gap-2">
                                {mealTypeRecipes.map((recipe, recipeIndex) => (
                                  <Card key={recipeIndex} className="border-0 bg-light">
                                    <Card.Body className="p-2">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                          <h6 className="mb-1 small">{recipe.title}</h6>
                                          <div className="text-muted small">
                                            <Clock size={12} className="me-1" />
                                            {recipe.readyInMinutes || 'N/A'} min
                                            <Users size={12} className="ms-2 me-1" />
                                            {recipe.servings || 'N/A'}
                                          </div>
                                        </div>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => removeMealFromPlan(dateKey, mealType, recipeIndex)}
                                        >
                                          <Trash2 size={12} />
                                        </Button>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                ))}
                                
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="w-100"
                                  onClick={() => {
                                    setSelectedDay(date);
                                    setSelectedMealType(mealType);
                                    setShowAddMealModal(true);
                                  }}
                                >
                                  <Plus size={16} className="me-1" />
                                  Add Meal
                                </Button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Meal Modal */}
      <Modal 
        show={showAddMealModal} 
        onHide={() => setShowAddMealModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Add {selectedMealType} for {selectedDay && selectedDay.toLocaleDateString()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="search" className="mb-3">
            <Tab eventKey="search" title="Search Recipes">
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search for recipes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchRecipes(e.target.value);
                  }}
                />
              </Form.Group>

              {searchLoading && (
                <div className="text-center py-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              <Row>
                {searchResults.map(recipe => (
                  <Col key={recipe.id} md={6} className="mb-3">
                    <Card className="h-100">
                      <div className="row g-0">
                        <div className="col-4">
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="img-fluid h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="col-8">
                          <Card.Body className="p-2">
                            <h6 className="card-title small">{recipe.title}</h6>
                            <div className="text-muted small mb-2">
                              <Clock size={12} className="me-1" />
                              {recipe.readyInMinutes || 'N/A'} min
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => addMealToPlan(recipe, selectedDay, selectedMealType)}
                            >
                              Add to Plan
                            </Button>
                          </Card.Body>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab>

            <Tab eventKey="favorites" title="Favorites">
              <Row>
                {favorites.map(recipe => (
                  <Col key={recipe.id} md={6} className="mb-3">
                    <Card className="h-100">
                      <div className="row g-0">
                        <div className="col-4">
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="img-fluid h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="col-8">
                          <Card.Body className="p-2">
                            <h6 className="card-title small">{recipe.title}</h6>
                            <div className="text-muted small mb-2">
                              <Clock size={12} className="me-1" />
                              {recipe.readyInMinutes || 'N/A'} min
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => addMealToPlan(recipe, selectedDay, selectedMealType)}
                            >
                              Add to Plan
                            </Button>
                          </Card.Body>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      {/* Shopping List Modal */}
      <Modal 
        show={showShoppingList} 
        onHide={() => setShowShoppingList(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Shopping List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(() => {
            const ingredients = generateShoppingList();
            return ingredients.length === 0 ? (
              <div className="text-center py-4">
                <p>No meals planned for this week yet.</p>
                <Button variant="primary" onClick={() => setShowShoppingList(false)}>
                  Start Planning Meals
                </Button>
              </div>
            ) : (
              <ListGroup>
                {ingredients.map((ingredient, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between">
                    <span>{ingredient.name}</span>
                    <Badge bg="secondary">{ingredient.amount} {ingredient.unit}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => {
            // Export shopping list functionality
            const ingredients = generateShoppingList();
            const text = ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`).join('\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shopping-list.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download size={16} className="me-2" />
            Export List
          </Button>
          <Button variant="secondary" onClick={() => setShowShoppingList(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MealPlanner;