import React from 'react';
import { Spinner, Card } from 'react-bootstrap';
import { ChefHat } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullPage = false,
  variant = 'primary'
}) => {
  const spinnerSizes = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' }
  };

  const LoadingContent = () => (
    <div className="text-center">
      <div className="mb-3">
        <Spinner 
          animation="border" 
          variant={variant}
          style={spinnerSizes[size]}
        />
      </div>
      {text && (
        <div>
          <p className="text-muted mb-0">{text}</p>
          {size === 'lg' && (
            <small className="text-muted">
              <ChefHat size={16} className="me-1" />
              Preparing something delicious...
            </small>
          )}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div 
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '50vh' }}
      >
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5">
            <LoadingContent />
          </Card.Body>
        </Card>
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
