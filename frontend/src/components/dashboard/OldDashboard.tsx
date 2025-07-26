import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  FireIcon, 
  PlayIcon,
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../ui';
import { useLearningStore, useAuthStore } from '../../store';
import type { LearningPath } from '../../types';

interface DashboardProps {
  onStartLearning?: (pathId: string) => void;
  onCreatePath?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onStartLearning, 
  onCreatePath 
}) => {
  const { user } = useAuthStore();
  const { 
    availablePaths, 
    loadLearningPaths, 
    loadPathProgress,
    setCurrentPath,
    isLoading 
  } = useLearningStore();

  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'recommended'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Load learning paths when component mounts
    loadLearningPaths();
  }, [loadLearningPaths]);

  const categories = [
    'all',
    'programming', 
    'data-science', 
    'design', 
    'business',
    'languages',
    'science'
  ];

  const handleStartPath = (path: LearningPath) => {
    setCurrentPath(path);
    if (user) {
      loadPathProgress(path.id);
    }
    onStartLearning?.(path.id);
  };

  const getProgressPercentage = (): number => {
    // In a real app, this would come from userProgress data
    // For demo, return random progress
    return Math.floor(Math.random() * 100);
  };

  const getTimeEstimate = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  const filteredPaths = availablePaths.filter(path => {
    if (selectedCategory !== 'all' && path.category !== selectedCategory) {
      return false;
    }
    
    const progress = getProgressPercentage();
    
    switch (filter) {
      case 'in-progress':
        return progress > 0 && progress < 100;
      case 'completed':
        return progress === 100;
      case 'recommended':
        return path.difficulty_level === 'beginner';
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username || 'Learner'}! 👋
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Continue your learning journey or discover something new
              </p>
            </div>
            
            <Button
              onClick={onCreatePath}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Path</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Stats Overview */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpenIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Paths Started</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FireIcon className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                    <p className="text-2xl font-bold text-gray-900">15 days</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Hours Learned</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Filters and Categories */}
          <div className="lg:col-span-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Progress Filter */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {(['all', 'in-progress', 'completed', 'recommended'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Learning Paths Grid */}
          <div className="lg:col-span-4">
            {filteredPaths.length === 0 ? (
              <Card className="p-12 text-center">
                <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No learning paths found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or create a new learning path to get started.
                </p>
                <Button onClick={onCreatePath}>
                  Create Your First Path
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPaths.map((path) => {
                  const progress = getProgressPercentage();
                  const isStarted = progress > 0;
                  const isCompleted = progress === 100;

                  return (
                    <Card key={path.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        {/* Path Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              path.difficulty_level === 'beginner' 
                                ? 'bg-green-100 text-green-800'
                                : path.difficulty_level === 'intermediate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {path.difficulty_level}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {path.category}
                            </span>
                          </div>
                          
                          {isCompleted && (
                            <TrophyIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>

                        {/* Path Content */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {path.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {path.description}
                        </p>

                        {/* Progress Bar */}
                        {isStarted && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Path Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{getTimeEstimate(path.estimated_duration_hours)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <ChartBarIcon className="h-4 w-4" />
                            <span>{Math.floor(Math.random() * 50) + 10} cards</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {path.tags && path.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {path.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {path.tags.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{path.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => handleStartPath(path)}
                          className="w-full flex items-center justify-center space-x-2"
                          variant={isCompleted ? 'outline' : 'primary'}
                        >
                          <PlayIcon className="h-4 w-4" />
                          <span>
                            {isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start Learning'}
                          </span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
