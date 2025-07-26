import React, { useState, useEffect } from 'react';
import { UserCircleIcon, AdjustmentsHorizontalIcon, BookmarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { SkillSearch } from '../search';
import { ProfileSidebar } from '../profile';
import { useLearningStore } from '../../store';
import { sampleLearningPaths } from '../../data/sampleData';
import type { LearningPath } from '../../types';

interface DashboardProps {
  onStartLearning: (pathId: string) => void;
  onCreatePath: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartLearning,
  onCreatePath,
}) => {
  const { loadLearningPaths } = useLearningStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [recentPaths, setRecentPaths] = useState<LearningPath[]>([]);
  const [bookmarkedPaths, setBookmarkedPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    loadLearningPaths();
    // Set some recent and bookmarked paths for demo
    setRecentPaths(sampleLearningPaths.slice(0, 3));
    setBookmarkedPaths(sampleLearningPaths.slice(3, 6));
  }, [loadLearningPaths]);

  const handleSelectPath = (pathId: string) => {
    setShowSearch(false);
    onStartLearning(pathId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">LearnInSlices</h1>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                AI-Powered Learning
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <UserCircleIcon className="w-6 h-6" />
                <span className="text-sm">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSearch ? (
          <div>
            {/* Search Section */}
            <SkillSearch onSelectPath={handleSelectPath} className="mb-12" />

            {/* Recent Learning */}
            {recentPaths.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentPaths.map((path) => (
                    <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">
                            {path.title.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {path.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {path.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSelectPath(path.id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Continue Learning
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarked Paths */}
            {bookmarkedPaths.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <BookmarkIcon className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-bold text-gray-900">Bookmarked</h2>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {bookmarkedPaths.map((path) => (
                    <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">
                            {path.title.charAt(0)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{path.estimated_duration_hours}h</span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {path.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {path.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {path.category}
                        </span>
                        <button
                          onClick={() => handleSelectPath(path.id)}
                          className="bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          Start Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Learning Path</h3>
                <p className="text-gray-600 mb-4">
                  Build a custom learning path tailored to your specific goals and interests.
                </p>
                <button
                  onClick={onCreatePath}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join Study Groups</h3>
                <p className="text-gray-600 mb-4">
                  Connect with fellow learners and study together in collaborative groups.
                </p>
                <button className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Explore Groups
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Starting your learning session...</p>
          </div>
        )}
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
