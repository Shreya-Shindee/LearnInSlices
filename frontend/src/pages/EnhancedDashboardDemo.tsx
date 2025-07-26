import React, { useState, useEffect } from 'react';
import { Dashboard } from '../components/dashboard';
import { MicroCardViewer } from '../components/learning';
import { ProgressAnalytics } from '../components/analytics';
import { sampleCards } from '../data/sampleCards';
import { useProgressStore } from '../store';

type View = 'dashboard' | 'learning' | 'analytics';

export const EnhancedDashboardDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const { userStats, addXP } = useProgressStore();

  // Add some demo progress data on first load
  useEffect(() => {
    if (userStats.total_xp === 0) {
      // Add some initial XP to show progress
      addXP(150);
    }
  }, [userStats.total_xp, addXP]);

  const handleStartLearning = (pathId: string) => {
    setSelectedPathId(pathId);
    setCurrentView('learning');
  };

  const handleCreatePath = () => {
    alert('Create Path feature coming soon! 🚀');
  };

  const handleLearningComplete = () => {
    setCurrentView('analytics');
    // Show celebration message
    setTimeout(() => {
      alert('🎉 Congratulations! You completed the learning session!');
    }, 500);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  // Learning View
  if (currentView === 'learning') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              
              <div className="text-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  Learning Session
                </h1>
                <p className="text-sm text-gray-600">
                  Path ID: {selectedPathId}
                </p>
              </div>
              
              <button
                onClick={handleViewAnalytics}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Learning Content */}
        <div className="py-8">
          <MicroCardViewer
            pathId={selectedPathId}
            cards={sampleCards}
            currentCardIndex={0}
            onComplete={handleLearningComplete}
            onCardChange={(index) => console.log('Current card:', index)}
          />
        </div>
      </div>
    );
  }

  // Analytics View
  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              
              <div className="text-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  Progress Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Track your learning journey
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Level {userStats.current_level}
                  </div>
                  <div className="text-xs text-gray-600">
                    {userStats.total_xp} XP
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {userStats.current_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressAnalytics />
        </div>
      </div>
    );
  }

  // Dashboard View (Default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-600">LearnInSlices</h1>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Enhanced Dashboard
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleViewAnalytics}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    Level {userStats.current_level}
                  </div>
                  <div className="text-gray-600">
                    {userStats.total_xp} XP
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {userStats.current_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <Dashboard
        onStartLearning={handleStartLearning}
        onCreatePath={handleCreatePath}
      />
    </div>
  );
};
