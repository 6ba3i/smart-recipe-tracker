/**
 * Footer Component
 * 
 * Features:
 * - Company information and links
 * - Social media links
 * - Quick navigation
 * - Newsletter signup
 * - Copyright information
 * - Responsive design
 */

import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert 
} from 'react-bootstrap';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChefHat,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    // Simulate newsletter signup
    setTimeout(() => {
      setNewsletterStatus({ 
        type: 'success', 
        message: 'Thank you for subscribing to our newsletter!' 
      });
      setEmail('');
      
      // Clear status after 5 seconds
      setTimeout(() => setNewsletterStatus(null), 5000);
    }, 1000);
  };

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Recipe Search' },
    { to: '/meal-planner', label: 'Meal Planner' },
    { to: '/nutrition', label: 'Nutrition Tracker' },
    { to: '/analytics', label: 'Analytics' }
  ];

  const supportLinks = [
    { to: '/help', label: 'Help Center' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/faq', label: 'FAQ' },
    { to: '/feedback', label: 'Feedback' },
    { to: '/bug-report', label: 'Report a Bug' }
  ];

  const legalLinks = [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/cookies', label: 'Cookie Policy' },
    { to: '/disclaimer', label: 'Disclaimer' }
  ];

  const socialLinks = [
    { 
      icon: Facebook, 
      href: 'https://facebook.com/recipeapp', 
      label: 'Facebook',
      color: '#1877f2'
    },
    { 
      icon: Twitter, 
      href: 'https://twitter.com/recipeapp', 
      label: 'Twitter',
      color: '#1da1f2'
    },
    { 
      icon: Instagram, 
      href: 'https://instagram.com/recipeapp', 
      label: 'Instagram',
      color: '#e4405f'
    },
    { 
      icon: Youtube, 
      href: 'https://youtube.com/recipeapp', 
      label: 'YouTube',
      color: '#ff0000'
    }
  ];

  return (
    <footer className="bg-dark text-light mt-auto">
      {/* Newsletter Section */}
      <div className="bg-primary py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h5 className="mb-2 text-white">
                <Mail className="me-2" />
                Stay Updated with New Recipes!
              </h5>
              <p className="mb-0 text-white-50">
                Get weekly recipe recommendations, cooking tips, and nutrition insights delivered to your inbox.
              </p>
            </Col>
            <Col md={4}>
              <Form onSubmit={handleNewsletterSignup}>
                <div className="input-group">
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0"
                  />
                  <Button type="submit" variant="light">
                    <Send size={16} />
                  </Button>
                </div>
              </Form>
              {newsletterStatus && (
                <Alert 
                  variant={newsletterStatus.type === 'success' ? 'success' : 'danger'} 
                  className="mt-2 py-2"
                >
                  {newsletterStatus.message}
                </Alert>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer Content */}
      <Container className="py-5">
        <Row>
          {/* Company Info */}
          <Col lg={4} md={6} className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <ChefHat size={32} className="text-primary me-2" />
              <h4 className="mb-0 text-white">RecipeApp</h4>
            </div>
            <p className="text-muted mb-3">
              Your ultimate companion for discovering, planning, and cooking delicious recipes. 
              Track nutrition, plan meals, and explore cuisines from around the world.
            </p>
            
            {/* Contact Info */}
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2 text-muted">
                <MapPin size={16} className="me-2" />
                <span>123 Recipe Street, Foodie City, FC 12345</span>
              </div>
              <div className="d-flex align-items-center mb-2 text-muted">
                <Phone size={16} className="me-2" />
                <span>+1 (555) 123-COOK</span>
              </div>
              <div className="d-flex align-items-center text-muted">
                <Mail size={16} className="me-2" />
                <span>hello@recipeapp.com</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="d-flex gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted"
                    style={{ 
                      transition: 'color 0.3s ease',
                      fontSize: '1.2rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = social.color}
                    onMouseLeave={(e) => e.target.style.color = ''}
                    title={social.label}
                  >
                    <IconComponent size={24} />
                  </a>
                );
              })}
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-primary mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              {quickLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.to} 
                    className="text-muted text-decoration-none"
                    style={{ transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#007bff'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Support */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-primary mb-3">Support</h6>
            <ul className="list-unstyled">
              {supportLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.to} 
                    className="text-muted text-decoration-none"
                    style={{ transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#007bff'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Legal */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-primary mb-3">Legal</h6>
            <ul className="list-unstyled">
              {legalLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.to} 
                    className="text-muted text-decoration-none"
                    style={{ transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#007bff'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* App Info */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-primary mb-3">Features</h6>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <small>✓ 500K+ Recipes</small>
              </li>
              <li className="mb-2">
                <small>✓ Meal Planning</small>
              </li>
              <li className="mb-2">
                <small>✓ Nutrition Tracking</small>
              </li>
              <li className="mb-2">
                <small>✓ Shopping Lists</small>
              </li>
              <li className="mb-2">
                <small>✓ AI Recommendations</small>
              </li>
              <li className="mb-2">
                <small>✓ Mobile Friendly</small>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Featured Stats */}
        <Row className="py-4 border-top border-secondary mt-4">
          <Col md={3} className="text-center mb-3">
            <h4 className="text-primary mb-1">500K+</h4>
            <small className="text-muted">Recipes Available</small>
          </Col>
          <Col md={3} className="text-center mb-3">
            <h4 className="text-primary mb-1">50K+</h4>
            <small className="text-muted">Active Users</small>
          </Col>
          <Col md={3} className="text-center mb-3">
            <h4 className="text-primary mb-1">1M+</h4>
            <small className="text-muted">Meals Planned</small>
          </Col>
          <Col md={3} className="text-center mb-3">
            <h4 className="text-primary mb-1">95%</h4>
            <small className="text-muted">User Satisfaction</small>
          </Col>
        </Row>
      </Container>

      {/* Copyright */}
      <div className="bg-black py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="mb-0 text-muted small">
                © {new Date().getFullYear()} RecipeApp. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <p className="mb-0 text-muted small">
                Made with <Heart size={14} className="text-danger mx-1" /> for food lovers everywhere
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;