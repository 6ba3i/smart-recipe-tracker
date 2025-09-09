import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Clock, Users, Star, ChefHat } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { formatCookingTime, formatRecipeTitle } from '../../utils/formatters';

const RecipeCard = ({ 
  recipe, 
  onClick,
  showFavoriteButton = true,
  variant = 'default', // 'default', 'compact', 'detailed'
  className = ''
}) => {
  const handleCardClick = (e) => {
    // Don't trigger if clicking on favorite button
    if (e.target.closest('button')) {
      return;
    }
    
    if (onClick) {
      onClick(recipe);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'secondary';
  };

  if (variant === 'compact') {
    return (
      <Card 
        className={`recipe-card h-100 ${className}`}
        onClick={handleCardClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="row g-0 h-100">
          <div className="col-4">
            <div className="position-relative h-100">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="img-fluid h-100 w-100"
                style={{ objectFit: 'cover' }}
              />
              {showFavoriteButton && (
                <div className="position-absolute top-0 end-0 p-2">
                  <FavoriteButton recipe={recipe} size="sm" />
                </div>
              )}
            </div>
          </div>
          <div className="col-8">
            <Card.Body className="p-3 d-flex flex-column h-100">
              <Card.Title className="h6 mb-2">
                {formatRecipeTitle(recipe.title, 40)}
              </Card.Title>
              
              <div className="text-muted small mb-2">
                <div className="d-flex align-items-center mb-1">
                  <Clock size={14} className="me-1" />
                  <span>{formatCookingTime(recipe.readyInMinutes)}</span>
                  <Users size={14} className="ms-3 me-1" />
                  <span>{recipe.servings || 'N/A'} servings</span>
                </div>
                
                {recipe.spoonacularScore && (
                  <div className="d-flex align-items-center">
                    <Star size={14} className="me-1 text-warning" />
                    <span>{Math.round(recipe.spoonacularScore)}/100</span>
                  </div>
                )}
              </div>

              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <div className="mt-auto">
                  {recipe.cuisines.slice(0, 2).map(cuisine => (
                    <Badge key={cuisine} bg="light" text="dark" className="me-1">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              )}
            </Card.Body>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card 
        className={`recipe-card h-100 ${className}`}
        onClick={handleCardClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="position-relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {showFavoriteButton && (
            <div className="position-absolute top-0 end-0 p-2">
              <FavoriteButton recipe={recipe} />
            </div>
          )}
          
          {recipe.healthScore && (
            <div className="position-absolute bottom-0 start-0 p-2">
              <Badge bg={getHealthScoreColor(recipe.healthScore)}>
                Health: {Math.round(recipe.healthScore)}/100
              </Badge>
            </div>
          )}
        </div>
        
        <Card.Body className="d-flex flex-column">
          <Card.Title className="h6">
            {formatRecipeTitle(recipe.title)}
          </Card.Title>
          
          {recipe.summary && (
            <Card.Text className="text-muted small">
              {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </Card.Text>
          )}
          
          <div className="row text-center text-muted small mb-3">
            <div className="col">
              <Clock size={16} className="d-block mx-auto mb-1" />
              <span>{formatCookingTime(recipe.readyInMinutes)}</span>
            </div>
            <div className="col">
              <Users size={16} className="d-block mx-auto mb-1" />
              <span>{recipe.servings || 'N/A'}</span>
            </div>
            <div className="col">
              <ChefHat size={16} className="d-block mx-auto mb-1" />
              <span>{recipe.difficulty || 'Medium'}</span>
            </div>
          </div>

          <div className="mt-auto">
            {recipe.cuisines && recipe.cuisines.length > 0 && (
              <div className="mb-2">
                {recipe.cuisines.slice(0, 3).map(cuisine => (
                  <Badge key={cuisine} bg="primary" className="me-1">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            )}

            {recipe.diets && recipe.diets.length > 0 && (
              <div className="mb-2">
                {recipe.diets.slice(0, 2).map(diet => (
                  <Badge key={diet} bg="success" className="me-1">
                    {diet}
                  </Badge>
                ))}
              </div>
            )}

            {recipe.spoonacularScore && (
              <div className="d-flex align-items-center justify-content-center">
                <Star size={16} className="text-warning me-1" />
                <span className="small">{Math.round(recipe.spoonacularScore)}/100</span>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={`recipe-card h-100 ${className}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="position-relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        {showFavoriteButton && (
          <div className="position-absolute top-0 end-0 p-2">
            <FavoriteButton recipe={recipe} />
          </div>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6">
          {formatRecipeTitle(recipe.title)}
        </Card.Title>
        
        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>
            <Clock size={14} className="me-1" />
            {formatCookingTime(recipe.readyInMinutes)}
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
        
        <div className="mt-auto">
          {recipe.cuisines && recipe.cuisines.length > 0 && (
            <div>
              {recipe.cuisines.slice(0, 2).map(cuisine => (
                <Badge key={cuisine} bg="light" text="dark" className="me-1">
                  {cuisine}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RecipeCard;