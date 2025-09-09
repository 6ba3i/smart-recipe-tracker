import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Row, 
  Col, 
  Badge, 
  ListGroup, 
  Button,
  Tab,
  Tabs,
  Alert,
  Card,
  Spinner
} from 'react-bootstrap';
import { 
  Clock, 
  Users, 
  Star, 
  ChefHat, 
  Heart,
  Share,
  Download,
  ExternalLink
} from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import NutritionChart from '../charts/NutritionChart';
import { SpoonacularAPI } from '../../services/spoonacularAPI';
import { formatCookingTime, formatCalories, formatMacronutrient } from '../../utils/formatters';

const RecipeDetails = ({ 
  show, 
  onHide, 
  recipe,
  showNutrition = true 
}) => {
  const [fullRecipe, setFullRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const api = new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY);

  useEffect(() => {
    if (show && recipe?.id && (!fullRecipe || fullRecipe.id !== recipe.id)) {
      loadRecipeDetails();
    }
  }, [show, recipe?.id]);

  const loadRecipeDetails = async () => {
    if (!recipe?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const details = await api.getRecipeDetails(recipe.id, true);
      setFullRecipe(details);
    } catch (err) {
      console.error('Error loading recipe details:', err);
      setError('Unable to load recipe details. Please try again.');
      setFullRecipe(recipe); // Fallback to basic recipe data
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && fullRecipe) {
      try {
        await navigator.share({
          title: fullRecipe.title,
          text: `Check out this recipe: ${fullRecipe.title}`,
          url: fullRecipe.sourceUrl || window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback to copying URL
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyUrl = () => {
    if (fullRecipe?.sourceUrl) {
      navigator.clipboard.writeText(fullRecipe.sourceUrl);
      // Could show a toast notification here
      alert('Recipe URL copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!recipe) return null;

  const displayRecipe = fullRecipe || recipe;

  return (
    <Modal show={show} onHide={onHide} size="xl" className="recipe-details-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <span className="me-3">{displayRecipe.title}</span>
          <div className="d-flex gap-2">
            <FavoriteButton recipe={displayRecipe} showText={false} />
            <Button variant="outline-secondary" size="sm" onClick={handleShare}>
              <Share size={16} />
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={handlePrint}>
              <Download size={16} />
            </Button>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading recipe details...</p>
          </div>
        )}

        {error && (
          <Alert variant="warning" className="mb-3">
            {error}
          </Alert>
        )}

        {displayRecipe && (
          <>
            {/* Hero Section */}
            <Row className="mb-4">
              <Col md={6}>
                <img 
                  src={displayRecipe.image} 
                  alt={displayRecipe.title}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                />
              </Col>
              <Col md={6}>
                <div className="h-100 d-flex flex-column">
                  {displayRecipe.summary && (
                    <div 
                      className="mb-3"
                      dangerouslySetInnerHTML={{ 
                        __html: displayRecipe.summary.substring(0, 300) + '...' 
                      }}
                    />
                  )}

                  <Row className="text-center mb-3">
                    <Col>
                      <div className="p-3 bg-light rounded">
                        <Clock size={24} className="text-primary mb-2" />
                        <div className="fw-bold">{formatCookingTime(displayRecipe.readyInMinutes)}</div>
                        <small className="text-muted">Total Time</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="p-3 bg-light rounded">
                        <Users size={24} className="text-success mb-2" />
                        <div className="fw-bold">{displayRecipe.servings || 'N/A'}</div>
                        <small className="text-muted">Servings</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="p-3 bg-light rounded">
                        <Star size={24} className="text-warning mb-2" />
                        <div className="fw-bold">
                          {displayRecipe.spoonacularScore ? Math.round(displayRecipe.spoonacularScore) : 'N/A'}
                        </div>
                        <small className="text-muted">Score</small>
                      </div>
                    </Col>
                  </Row>

                  {/* Tags */}
                  <div className="mt-auto">
                    {displayRecipe.cuisines && displayRecipe.cuisines.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted">Cuisines:</small><br />
                        {displayRecipe.cuisines.map(cuisine => (
                          <Badge key={cuisine} bg="primary" className="me-1">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {displayRecipe.diets && displayRecipe.diets.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted">Diets:</small><br />
                        {displayRecipe.diets.map(diet => (
                          <Badge key={diet} bg="success" className="me-1">
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {displayRecipe.dishTypes && displayRecipe.dishTypes.length > 0 && (
                      <div>
                        <small className="text-muted">Categories:</small><br />
                        {displayRecipe.dishTypes.slice(0, 3).map(type => (
                          <Badge key={type} bg="info" className="me-1">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Detailed Content */}
            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="overview" title="Overview">
                <Row>
                  <Col md={8}>
                    {/* Ingredients */}
                    <Card className="mb-4">
                      <Card.Header>
                        <h5 className="mb-0">Ingredients</h5>
                      </Card.Header>
                      <Card.Body>
                        {displayRecipe.extendedIngredients && displayRecipe.extendedIngredients.length > 0 ? (
                          <ListGroup variant="flush">
                            {displayRecipe.extendedIngredients.map((ingredient, index) => (
                              <ListGroup.Item key={index} className="d-flex justify-content-between">
                                <span>{ingredient.original || ingredient.name}</span>
                                {ingredient.image && (
                                  <img 
                                    src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                                    alt={ingredient.name}
                                    style={{ width: '30px', height: '30px' }}
                                  />
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted">Ingredients not available</p>
                        )}
                      </Card.Body>
                    </Card>

                    {/* Instructions */}
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Instructions</h5>
                      </Card.Header>
                      <Card.Body>
                        {displayRecipe.analyzedInstructions && displayRecipe.analyzedInstructions.length > 0 ? (
                          displayRecipe.analyzedInstructions.map((instruction, groupIndex) => (
                            <div key={groupIndex}>
                              {instruction.name && (
                                <h6 className="text-primary">{instruction.name}</h6>
                              )}
                              <ol>
                                {instruction.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="mb-3">
                                    <p>{step.step}</p>
                                    {step.ingredients && step.ingredients.length > 0 && (
                                      <div className="small text-muted">
                                        <strong>Ingredients: </strong>
                                        {step.ingredients.map(ing => ing.name).join(', ')}
                                      </div>
                                    )}
                                    {step.equipment && step.equipment.length > 0 && (
                                      <div className="small text-muted">
                                        <strong>Equipment: </strong>
                                        {step.equipment.map(eq => eq.name).join(', ')}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ))
                        ) : displayRecipe.instructions ? (
                          <div dangerouslySetInnerHTML={{ __html: displayRecipe.instructions }} />
                        ) : (
                          <p className="text-muted">Instructions not available</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    {/* Quick Info */}
                    <Card className="mb-3">
                      <Card.Header>
                        <h6 className="mb-0">Quick Info</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Prep Time:</span>
                          <span>{displayRecipe.preparationMinutes || 'N/A'} min</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Cook Time:</span>
                          <span>{displayRecipe.cookingMinutes || 'N/A'} min</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Total Time:</span>
                          <span>{formatCookingTime(displayRecipe.readyInMinutes)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Servings:</span>
                          <span>{displayRecipe.servings}</span>
                        </div>
                        {displayRecipe.pricePerServing && (
                          <div className="d-flex justify-content-between">
                            <span>Cost per serving:</span>
                            <span>${(displayRecipe.pricePerServing / 100).toFixed(2)}</span>
                          </div>
                        )}
                      </Card.Body>
                    </Card>

                    {/* Health Scores */}
                    {(displayRecipe.healthScore || displayRecipe.spoonacularScore) && (
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">Health & Quality</h6>
                        </Card.Header>
                        <Card.Body>
                          {displayRecipe.healthScore && (
                            <div className="d-flex justify-content-between mb-2">
                              <span>Health Score:</span>
                              <Badge bg={displayRecipe.healthScore > 70 ? 'success' : displayRecipe.healthScore > 40 ? 'warning' : 'danger'}>
                                {Math.round(displayRecipe.healthScore)}/100
                              </Badge>
                            </div>
                          )}
                          {displayRecipe.spoonacularScore && (
                            <div className="d-flex justify-content-between">
                              <span>Overall Score:</span>
                              <Badge bg="primary">
                                {Math.round(displayRecipe.spoonacularScore)}/100
                              </Badge>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    )}

                    {/* Source Link */}
                    {displayRecipe.sourceUrl && (
                      <Card>
                        <Card.Body className="text-center">
                          <Button 
                            variant="outline-primary"
                            href={displayRecipe.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={16} className="me-2" />
                            View Original Recipe
                          </Button>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </Row>
              </Tab>

              {showNutrition && displayRecipe.nutrition && (
                <Tab eventKey="nutrition" title="Nutrition">
                  <Row>
                    <Col md={8}>
                      <NutritionChart 
                        data={{
                          protein: displayRecipe.nutrition.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                          carbs: displayRecipe.nutrition.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                          fat: displayRecipe.nutrition.nutrients?.find(n => n.name === 'Fat')?.amount || 0
                        }}
                        title="Macronutrient Breakdown"
                        chartType="pie"
                      />
                    </Col>
                    <Col md={4}>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Nutrition Facts</h6>
                          <small className="text-muted">Per serving</small>
                        </Card.Header>
                        <Card.Body>
                          {displayRecipe.nutrition.nutrients && (
                            <div>
                              {displayRecipe.nutrition.nutrients.slice(0, 10).map((nutrient, index) => (
                                <div key={index} className="d-flex justify-content-between mb-2">
                                  <span className="small">{nutrient.name}:</span>
                                  <span className="small fw-bold">
                                    {nutrient.name === 'Calories' 
                                      ? formatCalories(nutrient.amount)
                                      : formatMacronutrient(nutrient.amount, nutrient.unit)
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
              )}

              {displayRecipe.winePairing && (
                <Tab eventKey="wine" title="Wine Pairing">
                  <Card>
                    <Card.Body>
                      <p>{displayRecipe.winePairing.pairingText}</p>
                      {displayRecipe.winePairing.productMatches && displayRecipe.winePairing.productMatches.length > 0 && (
                        <Row>
                          {displayRecipe.winePairing.productMatches.slice(0, 3).map((wine, index) => (
                            <Col key={index} md={4}>
                              <Card className="mb-3">
                                <Card.Img variant="top" src={wine.imageUrl} style={{ height: '200px', objectFit: 'contain' }} />
                                <Card.Body>
                                  <Card.Title className="h6">{wine.title}</Card.Title>
                                  <Card.Text className="small">{wine.description}</Card.Text>
                                  <div className="d-flex justify-content-between">
                                    <small className="text-muted">Score: {Math.round(wine.score * 100)}/100</small>
                                    <small className="text-success">{wine.price}</small>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
              )}
            </Tabs>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RecipeDetails;