import React from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <div className="text-center">
            <Card className="border-0 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
              <Card.Body className="p-5">
                <AlertTriangle size={64} className="text-warning mb-4" />
                <h3 className="mb-3">Oops! Something went wrong</h3>
                <p className="text-muted mb-4">
                  We're sorry, but something unexpected happened. 
                  Please try refreshing the page or go back to the home page.
                </p>
                
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="primary" onClick={this.handleReload}>
                    <RefreshCw size={16} className="me-2" />
                    Refresh Page
                  </Button>
                  <Button variant="outline-primary" href="/">
                    <Home size={16} className="me-2" />
                    Go Home
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <Alert variant="danger" className="mt-4 text-start">
                    <details>
                      <summary>Error Details (Development Only)</summary>
                      <pre className="mt-2 small">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;