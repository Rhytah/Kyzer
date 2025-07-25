// src/components/common/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-primary-dark mb-4">404</div>
          <div className="w-24 h-1 bg-primary-default mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-dark mb-3">
            Page Not Found
          </h1>
          <p className="text-text-medium leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            to="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-default text-white font-medium rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          
          <Link 
            to="/courses"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-background-dark text-text-medium font-medium rounded-lg hover:bg-background-medium transition-colors duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            Browse Courses
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center px-6 py-3 text-text-light font-medium rounded-lg hover:text-text-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-background-dark">
          <p className="text-sm text-text-muted">
            Still having trouble? {' '}
            <Link 
              to="/contact" 
              className="text-primary-default hover:text-primary-dark font-medium"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;