/**
 * Nutrition Tracker Page
 * 
 * Features:
 * - Daily nutrition logging
 * - Food database search
 * - Macro and micro nutrient tracking
 * - Progress charts with ECharts
 * - Goals setting and monitoring
 * - Weekly/monthly reports
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
  Alert,
  ProgressBar,
  Table,
  Tab,
  Tabs,
  InputGroup
} from 'react-bootstrap';
import { Activity, Download, Edit, Plus, Search, Target, Trash2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import FirebaseService from '../services/firebaseService';
import { SpoonacularAPI } from '../services/spoonacularAPI';

const NutritionTracker = () => {
  const { user, isAuthenticated } = useAuth();

  // Current date state
  const [selectedDate, setSelectedDate] = useState(new Date());  //   // 
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Nutrition data state
  const [dailyLog, setDailyLog] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);  //   // 
  const [monthlyData, setMonthlyData] = useState([]);
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    fiber: 25,
    sugar: 50
  });

  // Modal states
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Food search state
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Manual food entry state
  const [manualFood, setManualFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    serving: '',
    unit: 'gram'
  });

  // Loading and error states  //   // 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API instance
  const [api] = useState(() => new SpoonacularAPI(process.env.REACT_APP_SPOONACULAR_API_KEY));

  useEffect(() => {
    if (isAuthenticated) {
      loadDailyLog();
      loadWeeklyData();
      loadMonthlyData();
      loadNutritionGoals();
    }
  }, [selectedDate, isAuthenticated]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadDailyLog = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const log = await FirebaseService.getNutritionLog(user.uid, formatDate(selectedDate));
      setDailyLog(log || []);
    } catch (err) {
      console.error('Error loading daily log:', err);
      setError('Unable to load nutrition log.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    if (!user?.uid) return;

    try {
      const weekStart = new Date(currentWeek);
      weekStart.setDate(currentWeek.getDate() - currentWeek.getDay());
      
      const weekData = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const dayLog = await FirebaseService.getNutritionLog(user.uid, formatDate(day));
        weekData.push({
          date: formatDate(day),
          day: day.toLocaleDateString('en-US', { weekday: 'short' }),
          ...calculateDayTotals(dayLog || [])
        });
      }
      setWeeklyData(weekData);
    } catch (err) {
      console.error('Error loading weekly data:', err);
    }
  };

  const loadMonthlyData = async () => {
    if (!user?.uid) return;

    try {
      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const monthData = await FirebaseService.getNutritionRange(
        user.uid, 
        formatDate(monthStart), 
        formatDate(monthEnd)
      );
      setMonthlyData(monthData || []);
    } catch (err) {
      console.error('Error loading monthly data:', err);
    }
  };

  const loadNutritionGoals = async () => {
    if (!user?.uid) return;

    try {
      const goals = await FirebaseService.getNutritionGoals(user.uid);
      if (goals) {
        setNutritionGoals(goals);
      }
    } catch (err) {
      console.error('Error loading nutrition goals:', err);
    }
  };

  const calculateDayTotals = (entries) => {
    return entries.reduce((totals, entry) => {
      return {
        calories: (totals.calories || 0) + (entry.calories || 0),
        protein: (totals.protein || 0) + (entry.protein || 0),
        carbs: (totals.carbs || 0) + (entry.carbs || 0),
        fat: (totals.fat || 0) + (entry.fat || 0),
        fiber: (totals.fiber || 0) + (entry.fiber || 0),
        sugar: (totals.sugar || 0) + (entry.sugar || 0)
      };
    }, {});
  };

  const searchFood = async (query) => {
    if (!query.trim()) {
      setFoodSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await api.searchFood(query.trim(), 10);
      setFoodSearchResults(results.results || []);
    } catch (err) {
      console.error('Error searching food:', err);
      setFoodSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addFoodEntry = async (foodData) => {
    if (!user?.uid) return;

    try {
      const entry = {
        ...foodData,
        date: formatDate(selectedDate),
        timestamp: new Date().toISOString(),
        userId: user.uid
      };

      await FirebaseService.addNutritionEntry(user.uid, entry);
      await loadDailyLog();
      setShowAddFoodModal(false);
      resetFoodForms();
    } catch (err) {
      console.error('Error adding food entry:', err);
      setError('Unable to add food entry.');
    }
  };

  const updateFoodEntry = async (entryId, foodData) => {
    if (!user?.uid) return;

    try {
      await FirebaseService.updateNutritionEntry(user.uid, entryId, foodData);
      await loadDailyLog();
      setEditingEntry(null);
      setShowAddFoodModal(false);
    } catch (err) {
      console.error('Error updating food entry:', err);
      setError('Unable to update food entry.');
    }
  };

  const deleteFoodEntry = async (entryId) => {
    if (!user?.uid) return;

    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await FirebaseService.deleteNutritionEntry(user.uid, entryId);
        await loadDailyLog();
      } catch (err) {
        console.error('Error deleting food entry:', err);
        setError('Unable to delete food entry.');
      }
    }
  };

  const saveNutritionGoals = async () => {
    if (!user?.uid) return;

    try {
      await FirebaseService.saveNutritionGoals(user.uid, nutritionGoals);
      setShowGoalsModal(false);
      await loadDailyLog(); // Refresh to update progress bars
    } catch (err) {
      console.error('Error saving nutrition goals:', err);
      setError('Unable to save nutrition goals.');
    }
  };

  const resetFoodForms = () => {
    setFoodSearchQuery('');
    setFoodSearchResults([]);
    setManualFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      serving: '',
      unit: 'gram'
    });
    setEditingEntry(null);
  };

  const exportNutritionData = () => {
    const exportData = {
      dailyLog,
      weeklyData,
      nutritionGoals,
      exportDate: new Date().toISOString(),
      dateRange: formatDate(selectedDate)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-data-${formatDate(selectedDate)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart configurations
  const getCaloriesChartOption = () => {
    const dayTotals = calculateDayTotals(dailyLog);
    const caloriesConsumed = dayTotals.calories || 0;
    const caloriesRemaining = Math.max(0, nutritionGoals.calories - caloriesConsumed);

    return {
      title: {
        text: 'Daily Calories',
        left: 'center'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { name: 'Consumed', value: caloriesConsumed, itemStyle: { color: '#007bff' } },
          { name: 'Remaining', value: caloriesRemaining, itemStyle: { color: '#e9ecef' } }
        ],
        label: {
          formatter: '{b}: {c} cal'
        }
      }]
    };
  };

  const getMacrosChartOption = () => {
    const dayTotals = calculateDayTotals(dailyLog);
    
    return {
      title: {
        text: 'Macronutrients',
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: ['Protein', 'Carbs', 'Fat']
      },
      yAxis: {
        type: 'value',
        name: 'Grams'
      },
      series: [{
        type: 'bar',
        data: [
          { value: dayTotals.protein || 0, itemStyle: { color: '#28a745' } },
          { value: dayTotals.carbs || 0, itemStyle: { color: '#ffc107' } },
          { value: dayTotals.fat || 0, itemStyle: { color: '#dc3545' } }
        ]
      }]
    };
  };

  const getWeeklyTrendOption = () => {
    return {
      title: {
        text: 'Weekly Calorie Trend',
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: weeklyData.map(day => day.day)
      },
      yAxis: {
        type: 'value',
        name: 'Calories'
      },
      series: [{
        type: 'line',
        data: weeklyData.map(day => day.calories || 0),
        smooth: true,
        itemStyle: { color: '#007bff' }
      }]
    };
  };

  const dayTotals = calculateDayTotals(dailyLog);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">
              <Activity className="me-2" />
              Nutrition Tracker
            </h1>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowGoalsModal(true)}
              >
                <Target size={18} className="me-2" />
                Goals
              </Button>
              <Button
                variant="outline-secondary"
                onClick={exportNutritionData}
              >
                <Download size={18} className="me-2" />
                Export
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Date Selector */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(selectedDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  ← Previous Day
                </Button>
                
                <div className="text-center">
                  <h5 className="mb-0">{selectedDate.toLocaleDateString()}</h5>
                  <Form.Control
                    type="date"
                    value={formatDate(selectedDate)}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="mt-2"
                    style={{ width: '200px' }}
                  />
                </div>
                
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(selectedDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  Next Day →
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

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h5>Calories</h5>
              <div className="mb-2">
                <span className="h4">{dayTotals.calories || 0}</span>
                <span className="text-muted"> / {nutritionGoals.calories}</span>
              </div>
              <ProgressBar 
                now={(dayTotals.calories || 0) / nutritionGoals.calories * 100}
                variant={
                  (dayTotals.calories || 0) > nutritionGoals.calories * 1.1 ? 'danger' :
                  (dayTotals.calories || 0) > nutritionGoals.calories * 0.9 ? 'success' : 'warning'
                }
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h5>Protein</h5>
              <div className="mb-2">
                <span className="h4">{Math.round(dayTotals.protein || 0)}</span>
                <span className="text-muted">g / {nutritionGoals.protein}g</span>
              </div>
              <ProgressBar 
                now={(dayTotals.protein || 0) / nutritionGoals.protein * 100}
                variant="success"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h5>Carbs</h5>
              <div className="mb-2">
                <span className="h4">{Math.round(dayTotals.carbs || 0)}</span>
                <span className="text-muted">g / {nutritionGoals.carbs}g</span>
              </div>
              <ProgressBar 
                now={(dayTotals.carbs || 0) / nutritionGoals.carbs * 100}
                variant="warning"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h5>Fat</h5>
              <div className="mb-2">
                <span className="h4">{Math.round(dayTotals.fat || 0)}</span>
                <span className="text-muted">g / {nutritionGoals.fat}g</span>
              </div>
              <ProgressBar 
                now={(dayTotals.fat || 0) / nutritionGoals.fat * 100}
                variant="info"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col md={8}>
          {/* Food Log */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Food Log</h5>
              <Button
                variant="primary"
                onClick={() => {
                  resetFoodForms();
                  setShowAddFoodModal(true);
                }}
              >
                <Plus size={18} className="me-2" />
                Add Food
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : dailyLog.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No food logged for this day yet.</p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddFoodModal(true)}
                  >
                    Add Your First Entry
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Food</th>
                      <th>Serving</th>
                      <th>Calories</th>
                      <th>Protein</th>
                      <th>Carbs</th>
                      <th>Fat</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyLog.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.name}</td>
                        <td>{entry.serving} {entry.unit}</td>
                        <td>{Math.round(entry.calories || 0)}</td>
                        <td>{Math.round(entry.protein || 0)}g</td>
                        <td>{Math.round(entry.carbs || 0)}g</td>
                        <td>{Math.round(entry.fat || 0)}g</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setEditingEntry(entry);
                                setManualFood(entry);
                                setShowAddFoodModal(true);
                              }}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteFoodEntry(entry.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Charts */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
              <ReactECharts 
                option={getCaloriesChartOption()} 
                style={{ height: '300px' }}
              />
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <ReactECharts 
                option={getMacrosChartOption()} 
                style={{ height: '300px' }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Weekly Trend Chart */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <ReactECharts 
                option={getWeeklyTrendOption()} 
                style={{ height: '400px' }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Food Modal */}
      <Modal 
        show={showAddFoodModal} 
        onHide={() => {
          setShowAddFoodModal(false);
          resetFoodForms();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEntry ? 'Edit Food Entry' : 'Add Food Entry'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="search" className="mb-3">
            <Tab eventKey="search" title="Search Database">
              <Form.Group className="mb-3">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search for food..."
                    value={foodSearchQuery}
                    onChange={(e) => {
                      setFoodSearchQuery(e.target.value);
                      searchFood(e.target.value);
                    }}
                  />
                  <Button variant="outline-secondary">
                    <Search size={18} />
                  </Button>
                </InputGroup>
              </Form.Group>

              {searchLoading && (
                <div className="text-center py-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {foodSearchResults.map((food, index) => (
                  <Card key={index} className="mb-2">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{food.title}</h6>
                          <small className="text-muted">
                            {food.nutrition?.calories} cal per {food.servingSize} {food.servingUnit}
                          </small>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addFoodEntry({
                            name: food.title,
                            calories: food.nutrition?.calories || 0,
                            protein: food.nutrition?.protein || 0,
                            carbs: food.nutrition?.carbohydrates || 0,
                            fat: food.nutrition?.fat || 0,
                            serving: food.servingSize || 1,
                            unit: food.servingUnit || 'serving'
                          })}
                        >
                          Add
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Tab>

            <Tab eventKey="manual" title="Manual Entry">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Food Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={manualFood.name}
                        onChange={(e) => setManualFood({...manualFood, name: e.target.value})}
                        placeholder="e.g., Grilled Chicken Breast"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Serving Size</Form.Label>
                      <Form.Control
                        type="number"
                        value={manualFood.serving}
                        onChange={(e) => setManualFood({...manualFood, serving: e.target.value})}
                        placeholder="100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit</Form.Label>
                      <Form.Select
                        value={manualFood.unit}
                        onChange={(e) => setManualFood({...manualFood, unit: e.target.value})}
                      >
                        <option value="gram">grams</option>
                        <option value="oz">ounces</option>
                        <option value="cup">cups</option>
                        <option value="piece">pieces</option>
                        <option value="serving">servings</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Calories</Form.Label>
                      <Form.Control
                        type="number"
                        value={manualFood.calories}
                        onChange={(e) => setManualFood({...manualFood, calories: e.target.value})}
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Protein (g)</Form.Label>
                      <Form.Control
                        type="number"
                        value={manualFood.protein}
                        onChange={(e) => setManualFood({...manualFood, protein: e.target.value})}
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Carbs (g)</Form.Label>
                      <Form.Control
                        type="number"
                        value={manualFood.carbs}
                        onChange={(e) => setManualFood({...manualFood, carbs: e.target.value})}
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fat (g)</Form.Label>
                      <Form.Control
                        type="number"
                        value={manualFood.fat}
                        onChange={(e) => setManualFood({...manualFood, fat: e.target.value})}
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (editingEntry) {
                        updateFoodEntry(editingEntry.id, manualFood);
                      } else {
                        addFoodEntry(manualFood);
                      }
                    }}
                    disabled={!manualFood.name || !manualFood.calories}
                  >
                    {editingEntry ? 'Update Entry' : 'Add Entry'}
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      {/* Nutrition Goals Modal */}
      <Modal 
        show={showGoalsModal} 
        onHide={() => setShowGoalsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nutrition Goals</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Daily Calories</Form.Label>
                  <Form.Control
                    type="number"
                    value={nutritionGoals.calories}
                    onChange={(e) => setNutritionGoals({...nutritionGoals, calories: parseInt(e.target.value)})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Protein (g)</Form.Label>
                  <Form.Control
                    type="number"
                    value={nutritionGoals.protein}
                    onChange={(e) => setNutritionGoals({...nutritionGoals, protein: parseInt(e.target.value)})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Carbohydrates (g)</Form.Label>
                  <Form.Control
                    type="number"
                    value={nutritionGoals.carbs}
                    onChange={(e) => setNutritionGoals({...nutritionGoals, carbs: parseInt(e.target.value)})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fat (g)</Form.Label>
                  <Form.Control
                    type="number"
                    value={nutritionGoals.fat}
                    onChange={(e) => setNutritionGoals({...nutritionGoals, fat: parseInt(e.target.value)})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGoalsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveNutritionGoals}>
            Save Goals
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NutritionTracker;