import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import Logo from '@/components/Logo';

const SafeNavigation = () => {
  return (
    <ErrorBoundary fallback={
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">RepairHub</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    }>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <ErrorBoundary fallback={<span className="text-2xl font-bold text-blue-600">RepairHub</span>}>
                  <Logo variant="compact" size="xxl" />
                </ErrorBoundary>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link to="/blog" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Blog
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/client-auth" className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                Client
              </Link>
              <Link to="/repairer-auth" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Réparateur
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </ErrorBoundary>
  );
};

export default SafeNavigation;