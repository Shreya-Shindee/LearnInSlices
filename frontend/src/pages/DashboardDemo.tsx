import React, { useState } from 'react';
import { Dashboard } from '../components/dashboard';
import { MicroCardViewer } from '../components/learning';
import { sampleCards } from '../data/sampleCards';

export const DashboardDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'learning'>('dashboard');
  const [selectedPathId, setSelectedPathId] = useState<string>('');

  const handleStartLearning = (pathId: string) => {
    setSelectedPathId(pathId);
    setCurrentView('learning');
  };

  const handleCreatePath = () => {
    alert('Create Path feature coming soon! 🚀');
  };

  const handleLearningComplete = () => {
    setCurrentView('dashboard');
    alert('🎉 Congratulations! You completed the learning session!');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

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
              
              <div className="w-24"></div> {/* Spacer for centering */}
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

  return (
    <Dashboard
      onStartLearning={handleStartLearning}
      onCreatePath={handleCreatePath}
    />
  );
};
