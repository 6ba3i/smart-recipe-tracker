import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Button, 
  Row, 
  Col, 
  Alert,
  InputGroup 
} from 'react-bootstrap';
import { validateNumber, validateRequired } from '../../utils/validators';
import { formatMacronutrient } from '../../utils/formatters';

const NutritionForm = ({ 
  show, 
  onHide, 
  onSubmit, 
  initialData = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    serving: initialData?.serving || '',
    unit: initialData?.unit || 'gram',
    calories: initialData?.calories || '',
    protein: initialData?.protein || '',
    carbs: initialData?.carbs || '',
    fat: initialData?.fat || '',
    fiber: initialData?.fiber || '',
    sugar: initialData?.sugar || '',
    sodium: initialData?.sodium || '',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const units = [
    'gram', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const nameError = validateRequired(formData.name, 'Food name');
    if (nameError) newErrors.name = nameError;

    const servingError = validateNumber(formData.serving, 'Serving size', 0.1);
    if (servingError) newErrors.serving = servingError;

    const caloriesError = validateNumber(formData.calories, 'Calories', 0);
    if (caloriesError) newErrors.calories = caloriesError;

    // Optional but must be valid if provided
    if (formData.protein && validateNumber(formData.protein, 'Protein', 0)) {
      newErrors.protein = validateNumber(formData.protein, 'Protein', 0);
    }

    if (formData.carbs && validateNumber(formData.carbs, 'Carbohydrates', 0)) {
      newErrors.carbs = validateNumber(formData.carbs, 'Carbohydrates', 0);
    }

    if (formData.fat && validateNumber(formData.fat, 'Fat', 0)) {
      newErrors.fat = validateNumber(formData.fat, 'Fat', 0);
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
      serving: parseFloat(formData.serving),
      calories: parseFloat(formData.calories),
      protein: formData.protein ? parseFloat(formData.protein) : 0,
      carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
      fat: formData.fat ? parseFloat(formData.fat) : 0,
      fiber: formData.fiber ? parseFloat(formData.fiber) : 0,
      sugar: formData.sugar ? parseFloat(formData.sugar) : 0,
      sodium: formData.sodium ? parseFloat(formData.sodium) : 0
    };

    onSubmit(submissionData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      serving: '',
      unit: 'gram',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: '',
      notes: ''
    });
    setErrors({});
  };

  const calculateTotalMacros = () => {
    const protein = parseFloat(formData.protein) || 0;
    const carbs = parseFloat(formData.carbs) || 0;
    const fat = parseFloat(formData.fat) || 0;
    
    const proteinCals = protein * 4;
    const carbsCals = carbs * 4;
    const fatCals = fat * 9;
    
    return {
      total: proteinCals + carbsCals + fatCals,
      protein: proteinCals,
      carbs: carbsCals,
      fat: fatCals
    };
  };

  const macroCalories = calculateTotalMacros();

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? 'Edit Nutrition Entry' : 'Add Nutrition Entry'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Basic Information */}
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Food Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Grilled Chicken Breast"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Calories *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  placeholder="0"
                  isInvalid={!!errors.calories}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.calories}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Serving Size */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Serving Size *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={formData.serving}
                  onChange={(e) => handleInputChange('serving', e.target.value)}
                  placeholder="100"
                  isInvalid={!!errors.serving}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.serving}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unit</Form.Label>
                <Form.Select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}s
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Macronutrients */}
          <h6 className="mb-3">Macronutrients</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Protein (g)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => handleInputChange('protein', e.target.value)}
                  placeholder="0"
                  isInvalid={!!errors.protein}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.protein}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Carbohydrates (g)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange('carbs', e.target.value)}
                  placeholder="0"
                  isInvalid={!!errors.carbs}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.carbs}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fat (g)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => handleInputChange('fat', e.target.value)}
                  placeholder="0"
                  isInvalid={!!errors.fat}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fat}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Macro Calories Summary */}
          {(formData.protein || formData.carbs || formData.fat) && (
            <div className="bg-light p-3 rounded mb-3">
              <small className="text-muted">
                <strong>Calculated from macros:</strong> {Math.round(macroCalories.total)} calories
                {formData.calories && Math.abs(parseFloat(formData.calories) - macroCalories.total) > 10 && (
                  <span className="text-warning ms-2">
                    (Difference of {Math.round(Math.abs(parseFloat(formData.calories) - macroCalories.total))} calories)
                  </span>
                )}
              </small>
            </div>
          )}

          {/* Advanced Nutrition */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Additional Nutrients</h6>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {showAdvanced && (
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fiber (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => handleInputChange('fiber', e.target.value)}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sugar (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) => handleInputChange('sugar', e.target.value)}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sodium (mg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.sodium}
                    onChange={(e) => handleInputChange('sodium', e.target.value)}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Notes (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this food entry..."
            />
          </Form.Group>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Please fix the errors above before submitting.
            </Alert>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleReset} disabled={loading}>
            Reset
          </Button>
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Entry' : 'Add Entry'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NutritionForm;