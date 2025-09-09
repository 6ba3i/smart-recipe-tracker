import React from 'react';
import { Card, Button } from 'react-bootstrap';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  actionHref 
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        {Icon && <Icon size={64} className="text-muted mb-3" />}
        <h4 className="mb-3">{title}</h4>
        <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {description}
        </p>
        {(actionText && (onAction || actionHref)) && (
          <Button 
            variant="primary"
            onClick={onAction}
            href={actionHref}
          >
            {actionText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;