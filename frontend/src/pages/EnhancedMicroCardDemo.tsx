import React, { useState } from 'react';
import { EnhancedMicroCardViewer } from '../components/learning';
import { enhancedSampleCards } from '../data/enhancedSampleCards';
import { 
  PlayIcon, 
  AcademicCapIcon, 
  SparklesIcon,
  VideoCameraIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export const EnhancedMicroCardDemo: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleComplete = () => {
    setIsStarted(false);
    alert('🎉 Congratulations! You completed the enhanced learning experience!');
  };

  const handleCardChange = (index: number) => {
    setCurrentCard(index);
  };

  const totalVideos = enhancedSampleCards.reduce((sum, card) => 
    sum + (card.content.videos?.length || 0), 0
  );

  const totalQuizzes = enhancedSampleCards.filter(card => 
    card.content.quiz
  ).length;

  if (isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsStarted(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Overview
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <h1 className="text-xl font-bold text-gray-900">
                  Enhanced React Learning
                </h1>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>Card {currentCard + 1}/{enhancedSampleCards.length}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>{totalVideos} Videos</span>
                </span>
                <span className="flex items-center space-x-1">
                  <SparklesIcon className="w-4 h-4" />
                  <span>{totalQuizzes} Quizzes</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Learning Interface */}
        <div className="container mx-auto px-4 py-8">
          <EnhancedMicroCardViewer
            pathId="enhanced-path-1"
            cards={enhancedSampleCards}
            currentCardIndex={0}
            onComplete={handleComplete}
            onCardChange={handleCardChange}
            quizInterval={3}
            autoAdvanceVideos={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Enhanced Micro-Learning
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the future of interactive learning with animated cards, 
            integrated videos, and smart quizzes that adapt to your progress.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Start Enhanced Learning</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>~25 minutes interactive experience</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Swipe Gestures</h3>
            <p className="text-gray-600 text-sm">
              Natural touch gestures and click navigation with smooth animations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <VideoCameraIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Video Integration</h3>
            <p className="text-gray-600 text-sm">
              {totalVideos} curated videos with playlists and progress tracking
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <AcademicCapIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Quizzes</h3>
            <p className="text-gray-600 text-sm">
              Interactive quizzes appear every {3} cards with streak tracking
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Engaging Animations</h3>
            <p className="text-gray-600 text-sm">
              Smooth transitions and feedback animations for better engagement
            </p>
          </div>
        </div>

        {/* Learning Path Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 Enhanced React Components Path
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enhancedSampleCards.map((card, index) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {card.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{card.estimatedTime}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {card.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    {card.content.videos && (
                      <span className="flex items-center space-x-1">
                        <VideoCameraIcon className="w-3 h-3" />
                        <span>{card.content.videos.length}</span>
                      </span>
                    )}
                    {card.content.quiz && (
                      <span className="flex items-center space-x-1">
                        <AcademicCapIcon className="w-3 h-3" />
                        <span>Quiz</span>
                      </span>
                    )}
                  </div>
                  <span className="capitalize">{card.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Enhanced Learning Experience</h2>
            <p className="text-blue-100">
              Everything you need for effective micro-learning
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{enhancedSampleCards.length}</div>
              <div className="text-blue-100 text-sm">Interactive Cards</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{totalVideos}</div>
              <div className="text-blue-100 text-sm">Video Tutorials</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{totalQuizzes}</div>
              <div className="text-blue-100 text-sm">Knowledge Checks</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">∞</div>
              <div className="text-blue-100 text-sm">Swipe Animations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMicroCardDemo;
