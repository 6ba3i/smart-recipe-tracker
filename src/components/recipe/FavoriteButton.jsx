// ====================================
// src/components/recipe/FavoriteButton.jsx
// ====================================

import React, { useState } from 'react';
import { Button, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRecipe } from '../../contexts/RecipeContext';

const FavoriteButton = ({ 
  recipe, 
  size = 'sm', 
  variant = 'outline-primary',
  showText = false,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites, isRecipeFavorite } = useRecipe();
  const [loading, setLoading] = useState(false);

  const isFavorited = isRecipeFavorite(recipe.id);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!isAuthenticated) {
      // Could show a login modal or redirect here
      alert('Please sign in to save favorites');
      return;
    }

    try {
      setLoading(true);
      
      if (isFavorited) {
        await removeFromFavorites(recipe.id);
      } else {
        await addToFavorites(recipe);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Could show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const buttonContent = (
    <>
      {loading ? (
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      ) : (
        <Heart 
          size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
          fill={isFavorited ? 'currentColor' : 'none'}
          className={isFavorited ? 'text-danger' : ''}
        />
      )}
      {showText && (
        <span className="ms-2">
          {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      )}
    </>
  );

  const tooltipText = isAuthenticated 
    ? (isFavorited ? 'Remove from favorites' : 'Add to favorites')
    : 'Sign in to save favorites';

  if (!isAuthenticated && !showText) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltipText}</Tooltip>}
      >
        <Button
          variant="outline-secondary"
          size={size}
          className={className}
          disabled
        >
          <Heart size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        </Button>
      </OverlayTrigger>
    );
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltipText}</Tooltip>}
    >
      <Button
        variant={isFavorited ? 'danger' : variant}
        size={size}
        onClick={handleToggleFavorite}
        disabled={loading}
        className={className}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {buttonContent}
      </Button>
    </OverlayTrigger>
  );
};

export default FavoriteButton;