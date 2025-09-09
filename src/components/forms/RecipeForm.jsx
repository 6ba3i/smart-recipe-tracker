import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Button, 
  Row, 
  Col, 
  Alert,
  ListGroup,
  Badge
} from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';
import { 
  validateRequired, 
  validateNumber, 
  validateRecipeName,
  validateIngredients 
} from '../../utils/validators';

const RecipeForm = ({ 
  show, 
  onHide, 
  onSubmit, 
  initialData = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    servings: initialData?.servings || '',
    readyInMinutes: initialData?.readyInMinutes || '',
    difficulty: initialData?.difficulty || 'medium',
    cuisine: initialData?.cuisine || '',
    category: initialData?.category || '',
    ingredients: initialData?.ingredients || [{ name: '', amount: '', unit: '' }],
    instructions: initialData?.instructions || [''],
    tags: initialData?.tags || [],
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const difficulties = ['easy', 'medium', 'hard'];
  const cuisines = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 
    'Thai', 'Japanese', 'Mediterranean', 'Greek', 'Korean', 'Vietnamese'
  ];
  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Appetizer', 'Dessert', 'Snack', 
    'Side Dish', 'Soup', 'Salad', 'Beverage'
  ];
  const units = [
    'cup', 'tbsp', 'tsp', 'oz', 'lb', 'gram', 'kg', 'piece', 'slice', 'clove'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    const titleError = validateRecipeName(formData.title);
    if (titleError) newErrors.title = titleError;

    // Servings validation
    const servingsError = validateNumber(formData.servings, 'Servings', 1, 50);
    if (servingsError) newErrors.servings = servingsError;

    // Cooking time validation
    const timeError = validateNumber(formData.readyInMinutes, 'Cooking time', 1, 1440);
    if (timeError) newErrors.readyInMinutes = timeError;

    // Ingredients validation
    const ingredientsError = validateIngredients(formData.ingredients);
    if (ingredientsError) newErrors.ingredients = ingredientsError;

    // Instructions validation
    const validInstructions = formData.instructions.filter(inst => inst.trim().length > 0);
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      servings: parseInt(formData.servings),
      readyInMinutes: parseInt(formData.readyInMinutes),
      ingredients: formData.ingredients.filter(ing => ing.name.trim()),
      instructions: formData.instructions.filter(inst => inst.trim()),
      tags: formData.tags
    };

    onSubmit(submissionData);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? 'Edit Recipe' : 'Create New Recipe'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Basic Information */}
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Recipe Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter recipe title"
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Difficulty</Form.Label>
                <Form.Select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the recipe"
            />
          </Form.Group>

          {/* Details */}
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Servings *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', e.target.value)}
                  placeholder="4"
                  isInvalid={!!errors.servings}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.servings}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Cook Time (min) *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.readyInMinutes}
                  onChange={(e) => handleInputChange('readyInMinutes', e.target.value)}
                  placeholder="30"
                  isInvalid={!!errors.readyInMinutes}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.readyInMinutes}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine</Form.Label>
                <Form.Select
                  value={formData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                >
                  <option value="">Select cuisine</option>
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Ingredients */}
          <h6>Ingredients *</h6>
          {errors.ingredients && (
            <Alert variant="danger" className="py-2">
              {errors.ingredients}
            </Alert>
          )}
          
          {formData.ingredients.map((ingredient, index) => (
            <Row key={index} className="mb-2 align-items-end">
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                >
                  <option value="">Unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
              </Col>
            </Row>
          ))}
          
          <Button variant="outline-primary" size="sm" onClick={addIngredient} className="mb-3">
            <Plus size={16} className="me-1" />
            Add Ingredient
          </Button>

          {/* Instructions */}
          <h6>Instructions *</h6>
          {errors.instructions && (
            <Alert variant="danger" className="py-2">
              {errors.instructions}
            </Alert>
          )}
          
          {formData.instructions.map((instruction, index) => (
            <Row key={index} className="mb-2 align-items-start">
              <Col md={11}>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder={`Step ${index + 1}...`}
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                />
              </Col>
              <Col md={1}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeInstruction(index)}
                  disabled={formData.instructions.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
              </Col>
            </Row>
          ))}
          
          <Button variant="outline-primary" size="sm" onClick={addInstruction} className="mb-3">
            <Plus size={16} className="me-1" />
            Add Step
          </Button>

          {/* Tags */}
          <h6>Tags</h6>
          <Row className="mb-3">
            <Col md={10}>
              <Form.Control
                type="text"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" onClick={addTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </Col>
          </Row>
          
          {formData.tags.length > 0 && (
            <div className="mb-3">
              {formData.tags.map(tag => (
                <Badge key={tag} bg="secondary" className="me-2 mb-2">
                  {tag}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-2 text-white"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or tips"
            />
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Recipe' : 'Create Recipe'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecipeForm;