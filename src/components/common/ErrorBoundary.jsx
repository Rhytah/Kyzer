// components/common/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-text-dark mb-4">
              Something went wrong
            </h1>
            
            <p className="text-text-light mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full px-4 py-2 bg-background-white text-text-medium border border-background-dark rounded-lg hover:bg-background-light transition-colors"
              >
                Go to Home
              </button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-text-light hover:text-text-medium">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-red-50 rounded-lg text-xs text-red-700 overflow-auto">
                  <div className="font-semibold mb-2">Error:</div>
                  <pre className="whitespace-pre-wrap mb-4">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                  
                  <div className="font-semibold mb-2">Component Stack:</div>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;