import React, { useState } from 'react';
import { Sparkles, BookOpen, Users, Trophy, Settings, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store';

interface UnifiedHeaderProps {
  showLogo?: boolean;
  showNavigation?: boolean;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  showLogo = true,
  showNavigation = true,
  currentView = 'enhanced-cards',
  onViewChange
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'enhanced-cards', label: '🚀 Enhanced Cards', icon: Sparkles },
    { id: 'enhanced', label: '📊 Enhanced Dashboard', icon: BookOpen },
    { id: 'dashboard', label: '🎯 Classic Dashboard', icon: Trophy },
    { id: 'cards', label: '📚 Basic Cards', icon: Users },
  ];

  const handleViewChange = (viewId: string) => {
    onViewChange?.(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          {showLogo && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  LearnInSlices
                </h1>
                <p className="text-xs text-gray-500 -mt-1">AI-Powered Microlearning</p>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">Level 1 • Active</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => {/* TODO: Implement settings */}}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105">
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            {showNavigation && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {showNavigation && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
