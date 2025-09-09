import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Search } from 'lucide-react';

const RecipeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Mock results for now
    setResults([
      { id: 1, title: 'Sample Recipe 1', description: 'A delicious sample recipe' },
      { id: 2, title: 'Sample Recipe 2', description: 'Another great recipe' }
    ]);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Recipe Search</h2>
          <Form onSubmit={handleSearch} className="mt-3 mb-4">
            <Row>
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Search for recipes, ingredients, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100">
                  <Search size={16} className="me-2" />
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
          
          <Row>
            {results.map(recipe => (
              <Col key={recipe.id} md={6} lg={4} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{recipe.title}</Card.Title>
                    <Card.Text>{recipe.description}</Card.Text>
                    <Button variant="outline-primary" size="sm">View Recipe</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          {results.length === 0 && searchQuery && (
            <div className="text-center mt-4">
              <p>No recipes found. Try a different search term.</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeSearch;