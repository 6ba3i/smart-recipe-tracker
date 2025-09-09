import React, { useState } from 'react';
import { Row, Col, Pagination, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Grid, List, Filter } from 'lucide-react';
import RecipeCard from './RecipeCard';
import RecipeDetails from './RecipeDetails';
import EmptyState from '../common/EmptyState';

const RecipeList = ({ 
  recipes = [],
  loading = false,
  error = null,
  onRecipeClick,
  showPagination = true,
  itemsPerPage = 12,
  currentPage = 1,
  onPageChange,
  totalResults = 0,
  viewMode = 'grid', // 'grid' or 'list'
  onViewModeChange,
  showViewToggle = true,
  sortBy = 'relevance',
  onSortChange,
  emptyStateMessage = 'No recipes found',
  emptyStateAction,
  className = ''
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const handleRecipeClick = (recipe) => {
    if (onRecipeClick) {
      onRecipeClick(recipe);
    } else {
      setSelectedRecipe(recipe);
      setShowRecipeModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'healthiness', label: 'Healthiness' },
    { value: 'time', label: 'Cooking Time' },
    { value: 'title', label: 'Name (A-Z)' }
  ];

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <h5>Oops! Something went wrong</h5>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Alert>
    );
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={Filter}
        title={emptyStateMessage}
        description="Try adjusting your search terms or filters to find more recipes."
        actionText={emptyStateAction?.text}
        onAction={emptyStateAction?.onClick}
        actionHref={emptyStateAction?.href}
      />
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      {(showViewToggle || onSortChange) && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            {totalResults > 0 && (
              <span className="text-muted me-3">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} recipes
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-3">
            {onSortChange && (
              <Form.Group className="d-flex align-items-center mb-0">
                <Form.Label className="me-2 mb-0">Sort by:</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={sortBy} 
                  onChange={(e) => onSortChange(e.target.value)}
                  style={{ width: '150px' }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {showViewToggle && onViewModeChange && (
              <div className="btn-group" role="group">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recipe Grid/List */}
      <Row>
        {recipes.map((recipe) => (
          <Col 
            key={recipe.id} 
            xs={12}
            sm={viewMode === 'list' ? 12 : 6} 
            md={viewMode === 'list' ? 12 : 4} 
            lg={viewMode === 'list' ? 12 : 3} 
            className="mb-4"
          >
            <RecipeCard 
              recipe={recipe} 
              onClick={handleRecipeClick}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const page = Math.max(1, currentPage - 2) + index;
              if (page <= totalPages) {
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              }
              return null;
            })}
            
            <Pagination.Next 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Recipe Details Modal */}
      <RecipeDetails
        show={showRecipeModal}
        onHide={handleCloseModal}
        recipe={selectedRecipe}
      />
    </div>
  );
};

export default RecipeList;