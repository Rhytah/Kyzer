// src/components/common/ErrorBoundary.jsx - Catches PGRST116 and other errors
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to your error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const isPGRST116 = this.state.error?.message?.includes('PGRST116') || 
                         this.state.error?.code === 'PGRST116';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {isPGRST116 ? 'Setup Required' : 'Something Went Wrong'}
                </h2>
              </div>
              
              {isPGRST116 ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    It looks like you haven't set up your organization yet. This is normal for new users.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.href = '/company/setup'}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Set Up Organization
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Go to Personal Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    We encountered an unexpected error. Please try refreshing the page.
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                      <strong>Error:</strong> {this.state.error?.message}
                      <br />
                      <strong>Code:</strong> {this.state.error?.code}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <button
                      onClick={this.handleRetry}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Refresh Page
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier use
export const withErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;