import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="text-red-600" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center text-sm mb-4">
              We encountered an unexpected error. Please refresh the page and try again.
            </p>
            {import.meta.env.DEV && (
              <div className="bg-gray-100 p-3 rounded text-xs text-gray-700 overflow-auto max-h-32 mb-4">
                <p className="font-bold">Error details:</p>
                <p>{this.state.error?.toString()}</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
