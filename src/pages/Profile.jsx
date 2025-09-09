/**
 * Profile Page
 * 
 * Features:
 * - User profile management
 * - Account settings
 * - Dietary preferences
 * - Activity history
 * - Data export/import
 * - Account deletion
 * - Statistics overview
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert,
  Badge,
  Modal,
  Tab,
  Tabs,
  Table,
  ProgressBar,
  ListGroup
} from 'react-bootstrap';
import { 
  User, 
  Settings, 
  Download, 
  Upload, 
  Trash2,
  Save,
  Edit,
  Activity,
  Award,
  Calendar,
  Heart,
  ChefHat,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import FirebaseService from '../services/firebaseService';

const Profile = () => {
  const { 
    user, 
    updateUserProfile, 
    resetPassword,
    logout 
  } = useAuth();
  const { favorites, mealPlans } = useRecipe();

  // Profile state
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    location: '',
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    skillLevel: 'beginner'
  });

  // Dietary preferences
  const [dietaryPrefs, setDietaryPrefs] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    keto: false,
    paleo: false,
    lowCarb: false,
    lowSodium: false
  });

  // Statistics
  const [stats, setStats] = useState({
    totalFavorites: 0,
    totalMealPlans: 0,
    recipesCooked: 0,
    joinDate: null,
    lastActivity: null,
    favoritesCuisines: [],
    averageCookTime: 0
  });

  // Activity history
  const [activityHistory, setActivityHistory] = useState([]);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserStats();
      loadActivityHistory();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;

    try {
      const userProfile = await FirebaseService.getUserProfile(user.uid);
      
      setProfile({
        displayName: user.displayName || userProfile?.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || userProfile?.photoURL || '',
        bio: userProfile?.bio || '',
        location: userProfile?.location || '',
        dietaryRestrictions: userProfile?.dietaryRestrictions || [],
        allergies: userProfile?.allergies || [],
        cuisinePreferences: userProfile?.cuisinePreferences || [],
        skillLevel: userProfile?.skillLevel || 'beginner'
      });

      if (userProfile?.dietaryPreferences) {
        setDietaryPrefs(userProfile.dietaryPreferences);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Unable to load profile data.');
    }
  };

  const loadUserStats = async () => {
    if (!user?.uid) return;

    try {
      const userStats = await FirebaseService.getUserStats(user.uid);
      
      // Calculate stats from available data
      const cuisineCount = {};
      favorites.forEach(recipe => {
        if (recipe.cuisines) {
          recipe.cuisines.forEach(cuisine => {
            cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
          });
        }
      });

      const topCuisines = Object.entries(cuisineCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cuisine, count]) => ({ cuisine, count }));

      const avgCookTime = favorites.reduce((sum, recipe) => 
        sum + (recipe.readyInMinutes || 0), 0) / (favorites.length || 1);

      setStats({
        totalFavorites: favorites.length,
        totalMealPlans: Object.keys(mealPlans).length,
        recipesCooked: userStats?.recipesCooked || 0,
        joinDate: user.metadata?.creationTime || null,
        lastActivity: userStats?.lastActivity || new Date().toISOString(),
        favoritesCuisines: topCuisines,
        averageCookTime: Math.round(avgCookTime)
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadActivityHistory = async () => {
    if (!user?.uid) return;

    try {
      const history = await FirebaseService.getUserActivityHistory(user.uid, 20);
      setActivityHistory(history || []);
    } catch (err) {
      console.error('Error loading activity history:', err);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Update Firebase Auth profile
      await updateUserProfile({
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });

      // Save extended profile to Firestore
      const profileData = {
        ...profile,
        dietaryPreferences: dietaryPrefs,
        updatedAt: new Date().toISOString()
      };

      await FirebaseService.saveUserProfile(user.uid, profileData);

      setSuccess('Profile updated successfully!');
      setEditingField(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(user.email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Unable to send password reset email.');
    }
  };

  const handleDeleteAccount = async () => {
    // This would require careful implementation with proper user confirmation
    setError('Account deletion is not implemented in this demo.');
  };

  const exportUserData = async () => {
    try {
      const userData = {
        profile,
        stats,
        favorites,
        mealPlans,
        activityHistory,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recipe-app-data-${user.uid}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Unable to export data.');
    }
  };

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some cooking experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced cook' },
    { value: 'expert', label: 'Expert', description: 'Professional level' }
  ];

  const commonAllergies = [
    'Nuts', 'Shellfish', 'Eggs', 'Dairy', 'Soy', 'Gluten', 'Fish', 'Sesame'
  ];

  const cuisineOptions = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 
    'French', 'Thai', 'Chinese', 'Japanese', 'Greek', 'Spanish'
  ];

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">
              <User className="me-2" />
              My Profile
            </h1>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={18} className="me-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowExportModal(true)}
              >
                <Download size={18} className="me-2" />
                Export Data
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Profile Overview */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <User size={48} className="text-muted" />
                  </div>
                )}
              </div>
              
              <h4>{profile.displayName || 'Anonymous User'}</h4>
              <p className="text-muted">{profile.email}</p>
              
              {profile.location && (
                <p className="text-muted">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {profile.location}
                </p>
              )}
              
              <Badge bg="primary" className="mb-2">
                {skillLevels.find(level => level.value === profile.skillLevel)?.label || 'Beginner'}
              </Badge>
              
              {profile.bio && (
                <div className="mt-3">
                  <hr />
                  <p className="text-muted small">{profile.bio}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Row>
            <Col md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <Heart size={32} className="text-danger mb-2" />
                  <h3>{stats.totalFavorites}</h3>
                  <p className="text-muted mb-0">Favorite Recipes</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <Calendar size={32} className="text-primary mb-2" />
                  <h3>{stats.totalMealPlans}</h3>
                  <p className="text-muted mb-0">Meal Plans</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <ChefHat size={32} className="text-success mb-2" />
                  <h3>{stats.recipesCooked}</h3>
                  <p className="text-muted mb-0">Recipes Cooked</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <Target size={32} className="text-warning mb-2" />
                  <h3>{stats.averageCookTime}min</h3>
                  <p className="text-muted mb-0">Avg Cook Time</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Detailed Information Tabs */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="preferences" className="mb-3">
                <Tab eventKey="preferences" title="Dietary Preferences">
                  <Row>
                    <Col md={6}>
                      <h6>Dietary Restrictions</h6>
                      <div className="mb-3">
                        {Object.entries(dietaryPrefs).map(([key, value]) => (
                          <Badge 
                            key={key} 
                            bg={value ? 'success' : 'light'} 
                            text={value ? 'white' : 'dark'}
                            className="me-2 mb-2"
                          >
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Badge>
                        ))}
                      </div>

                      <h6>Allergies</h6>
                      <div className="mb-3">
                        {profile.allergies.length > 0 ? (
                          profile.allergies.map(allergy => (
                            <Badge key={allergy} bg="warning" className="me-2 mb-2">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted">No allergies specified</p>
                        )}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Favorite Cuisines</h6>
                      <div className="mb-3">
                        {stats.favoritesCuisines.length > 0 ? (
                          stats.favoritesCuisines.map(({ cuisine, count }) => (
                            <div key={cuisine} className="d-flex justify-content-between align-items-center mb-2">
                              <span>{cuisine}</span>
                              <div className="d-flex align-items-center">
                                <ProgressBar 
                                  now={(count / stats.totalFavorites) * 100} 
                                  style={{ width: '100px' }}
                                  className="me-2"
                                />
                                <small className="text-muted">{count}</small>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No cuisine preferences yet</p>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="activity" title="Activity History">
                  {activityHistory.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Activity</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityHistory.map((activity, index) => (
                          <tr key={index}>
                            <td>{new Date(activity.timestamp).toLocaleDateString()}</td>
                            <td>
                              <Badge bg="primary">{activity.type}</Badge>
                            </td>
                            <td>{activity.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <Activity size={48} className="text-muted mb-3" />
                      <p className="text-muted">No recent activity</p>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="settings" title="Account Settings">
                  <Row>
                    <Col md={6}>
                      <h6>Account Information</h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span>Email</span>
                          <span>{profile.email}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span>Member Since</span>
                          <span>
                            {stats.joinDate ? new Date(stats.joinDate).toLocaleDateString() : 'Unknown'}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span>Last Activity</span>
                          <span>
                            {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Unknown'}
                          </span>
                        </ListGroup.Item>
                      </ListGroup>

                      <div className="mt-4">
                        <Button 
                          variant="outline-warning" 
                          className="me-2 mb-2"
                          onClick={handleResetPassword}
                        >
                          Reset Password
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          className="me-2 mb-2"
                          onClick={() => setShowExportModal(true)}
                        >
                          <Download size={16} className="me-2" />
                          Export Data
                        </Button>
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Danger Zone</h6>
                      <Card className="border-danger">
                        <Card.Body>
                          <h6 className="text-danger">Delete Account</h6>
                          <p className="text-muted small">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                          >
                            <Trash2 size={16} className="me-2" />
                            Delete Account
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Basic Info">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Display Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Skill Level</Form.Label>
                  <Form.Select
                    value={profile.skillLevel}
                    onChange={(e) => setProfile({...profile, skillLevel: e.target.value})}
                  >
                    {skillLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Form>
            </Tab>

            <Tab eventKey="dietary" title="Dietary Preferences">
              <h6>Dietary Restrictions</h6>
              <Row className="mb-4">
                {Object.entries(dietaryPrefs).map(([key, value]) => (
                  <Col key={key} md={4} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      checked={value}
                      onChange={(e) => setDietaryPrefs({...dietaryPrefs, [key]: e.target.checked})}
                    />
                  </Col>
                ))}
              </Row>

              <h6>Allergies</h6>
              <Row className="mb-4">
                {commonAllergies.map(allergy => (
                  <Col key={allergy} md={4} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      label={allergy}
                      checked={profile.allergies.includes(allergy)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile({
                            ...profile,
                            allergies: [...profile.allergies, allergy]
                          });
                        } else {
                          setProfile({
                            ...profile,
                            allergies: profile.allergies.filter(a => a !== allergy)
                          });
                        }
                      }}
                    />
                  </Col>
                ))}
              </Row>

              <h6>Preferred Cuisines</h6>
              <Row>
                {cuisineOptions.map(cuisine => (
                  <Col key={cuisine} md={4} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      label={cuisine}
                      checked={profile.cuisinePreferences.includes(cuisine)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile({
                            ...profile,
                            cuisinePreferences: [...profile.cuisinePreferences, cuisine]
                          });
                        } else {
                          setProfile({
                            ...profile,
                            cuisinePreferences: profile.cuisinePreferences.filter(c => c !== cuisine)
                          });
                        }
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Export Data Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Your Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Download all your recipe app data including:</p>
          <ul>
            <li>Profile information</li>
            <li>Favorite recipes</li>
            <li>Meal plans</li>
            <li>Activity history</li>
            <li>Statistics</li>
          </ul>
          <p className="text-muted">
            Your data will be exported as a JSON file that you can save or import into other applications.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={exportUserData}>
            <Download size={16} className="me-2" />
            Export Data
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>This action cannot be undone!</strong>
          </Alert>
          <p>
            Deleting your account will permanently remove:
          </p>
          <ul>
            <li>Your profile and settings</li>
            <li>All favorite recipes</li>
            <li>Meal plans and history</li>
            <li>Activity records</li>
          </ul>
          <p>
            Are you absolutely sure you want to delete your account?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            <Trash2 size={16} className="me-2" />
            Delete My Account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;