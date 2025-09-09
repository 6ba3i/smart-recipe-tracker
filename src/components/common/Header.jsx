/**
 * Header Navigation Component
 * 
 * Features:
 * - Responsive navigation bar
 * - User authentication status
 * - Quick search functionality
 * - Mobile menu support
 * - Breadcrumb navigation
 * - Notifications bell
 */

import React, { useState } from 'react';
import { 
  Navbar, 
  Nav, 
  Container, 
  NavDropdown, 
  Form, 
  FormControl, 
  Button,
  Badge,
  Offcanvas
} from 'react-bootstrap';
import { 
  Search, 
  User, 
  Bell, 
  Heart, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  ChefHat
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRecipe } from '../../contexts/RecipeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    isAuthenticated, 
    logout, 
    userDisplayName 
  } = useAuth();
  const { favorites } = useRecipe();

  // State for mobile menu and search
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // Quick search handler
  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearchQuery.trim())}`);
      setQuickSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Get page title for breadcrumb
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Home',
      '/search': 'Recipe Search',
      '/meal-planner': 'Meal Planner',
      '/nutrition': 'Nutrition Tracker',
      '/favorites': 'Favorites',
      '/analytics': 'Analytics',
      '/profile': 'Profile'
    };
    return titles[path] || 'Recipe App';
  };

  return (
    <>
      <Navbar bg="white" expand="lg" className="border-bottom shadow-sm" sticky="top">
        <Container fluid>
          {/* Brand Logo */}
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
            <ChefHat size={28} className="me-2" />
            RecipeApp
          </Navbar.Brand>

          {/* Mobile Menu Toggle */}
          <Button
            variant="outline-primary"
            className="d-lg-none"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu size={20} />
          </Button>

          {/* Desktop Navigation */}
          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={location.pathname === '/' ? 'active fw-bold' : ''}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/search" 
                className={location.pathname === '/search' ? 'active fw-bold' : ''}
              >
                Search Recipes
              </Nav.Link>
              {isAuthenticated && (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/meal-planner" 
                    className={location.pathname === '/meal-planner' ? 'active fw-bold' : ''}
                  >
                    Meal Planner
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/nutrition" 
                    className={location.pathname === '/nutrition' ? 'active fw-bold' : ''}
                  >
                    Nutrition
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/favorites" 
                    className={location.pathname === '/favorites' ? 'active fw-bold' : ''}
                  >
                    <Heart size={16} className="me-1" />
                    Favorites
                    {favorites.length > 0 && (
                      <Badge bg="danger" className="ms-1">{favorites.length}</Badge>
                    )}
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/analytics" 
                    className={location.pathname === '/analytics' ? 'active fw-bold' : ''}
                  >
                    Analytics
                  </Nav.Link>
                </>
              )}
            </Nav>

            {/* Quick Search */}
            <Form className="d-flex me-3" onSubmit={handleQuickSearch}>
              <FormControl
                type="search"
                placeholder="Quick search..."
                className="me-2"
                style={{ width: '200px' }}
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                <Search size={18} />
              </Button>
            </Form>

            {/* User Menu */}
            <Nav>
              {isAuthenticated ? (
                <>
                  {/* Notifications Bell */}
                  <Nav.Link href="#" className="position-relative me-2">
                    <Bell size={20} />
                    <Badge 
                      bg="danger" 
                      className="position-absolute top-0 start-100 translate-middle badge-pill"
                      style={{ fontSize: '0.7rem' }}
                    >
                      2
                    </Badge>
                  </Nav.Link>

                  {/* User Dropdown */}
                  <NavDropdown 
                    title={
                      <span className="d-flex align-items-center">
                        {user?.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="rounded-circle me-2"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                        ) : (
                          <User size={20} className="me-2" />
                        )}
                        {userDisplayName}
                      </span>
                    } 
                    id="user-nav-dropdown"
                    align="end"
                  >
                    <NavDropdown.Item as={Link} to="/profile">
                      <User size={16} className="me-2" />
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/favorites">
                      <Heart size={16} className="me-2" />
                      Favorites ({favorites.length})
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/meal-planner">
                      <Calendar size={16} className="me-2" />
                      Meal Planner
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/analytics">
                      <BarChart3 size={16} className="me-2" />
                      Analytics
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#">
                      <Settings size={16} className="me-2" />
                      Settings
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={handleLogout}>
                      <LogOut size={16} className="me-2" />
                      Sign Out
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <ChefHat size={24} className="me-2" />
            RecipeApp
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Mobile Quick Search */}
          <Form className="mb-4" onSubmit={handleQuickSearch}>
            <div className="input-group">
              <FormControl
                type="search"
                placeholder="Search recipes..."
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <Search size={18} />
              </Button>
            </div>
          </Form>

          {/* Mobile Navigation Links */}
          <Nav className="flex-column">
            <Nav.Link 
              as={Link} 
              to="/" 
              onClick={() => setShowMobileMenu(false)}
              className="py-3 border-bottom"
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/search" 
              onClick={() => setShowMobileMenu(false)}
              className="py-3 border-bottom"
            >
              Search Recipes
            </Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/meal-planner" 
                  onClick={() => setShowMobileMenu(false)}
                  className="py-3 border-bottom"
                >
                  <Calendar size={18} className="me-2" />
                  Meal Planner
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/nutrition" 
                  onClick={() => setShowMobileMenu(false)}
                  className="py-3 border-bottom"
                >
                  Nutrition Tracker
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/favorites" 
                  onClick={() => setShowMobileMenu(false)}
                  className="py-3 border-bottom d-flex justify-content-between"
                >
                  <span>
                    <Heart size={18} className="me-2" />
                    Favorites
                  </span>
                  {favorites.length > 0 && (
                    <Badge bg="danger">{favorites.length}</Badge>
                  )}
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/analytics" 
                  onClick={() => setShowMobileMenu(false)}
                  className="py-3 border-bottom"
                >
                  <BarChart3 size={18} className="me-2" />
                  Analytics
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/profile" 
                  onClick={() => setShowMobileMenu(false)}
                  className="py-3 border-bottom"
                >
                  <User size={18} className="me-2" />
                  Profile
                </Nav.Link>
                
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center mb-3">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="rounded-circle me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={40} className="me-3 text-muted" />
                    )}
                    <div>
                      <div className="fw-bold">{userDisplayName}</div>
                      <small className="text-muted">{user?.email}</small>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline-danger" 
                    className="w-100"
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                  >
                    <LogOut size={18} className="me-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 pt-3 border-top">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/signup" 
                  variant="primary" 
                  className="w-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Breadcrumb */}
      {location.pathname !== '/' && (
        <Container fluid className="py-2 bg-light border-bottom">
          <div className="d-flex align-items-center text-muted small">
            <Link to="/" className="text-decoration-none text-muted">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-dark">{getPageTitle()}</span>
          </div>
        </Container>
      )}
    </>
  );
};

export default Header;