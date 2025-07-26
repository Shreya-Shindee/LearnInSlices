import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  PlayIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { Card, Button, LoadingSpinner } from '../ui';
import PerformanceAnalytics from '../analytics/PerformanceAnalytics';
import AdvancedFeatures from '../learning/AdvancedFeatures';

interface SuperchargedDashboardProps {
  className?: string;
}

export const SuperchargedDashboard: React.FC<SuperchargedDashboardProps> = ({ className }) => {
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'features' | 'settings'>('overview');
  const [notifications] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickStats = [
    { label: 'Today\'s XP', value: '247', change: '+23%', color: 'blue' },
    { label: 'Study Streak', value: '12 days', change: '+1', color: 'orange' },
    { label: 'Cards Due', value: '8', change: '-12', color: 'purple' },
    { label: 'Weekly Goal', value: '78%', change: '+15%', color: 'green' }
  ];

  const recentActivity = [
    { action: 'Completed React Hooks Path', time: '2 hours ago', type: 'success' },
    { action: 'Achieved Level 14', time: '5 hours ago', type: 'achievement' },
    { action: 'Perfect Quiz Score', time: '1 day ago', type: 'success' },
    { action: 'Started TypeScript Journey', time: '2 days ago', type: 'start' }
  ];

  const learningPaths = [
    { 
      name: 'Advanced React Patterns', 
      progress: 67, 
      difficulty: 'Advanced',
      cards: 45,
      timeEstimate: '2.5 hours'
    },
    { 
      name: 'TypeScript Fundamentals', 
      progress: 23, 
      difficulty: 'Intermediate',
      cards: 38,
      timeEstimate: '3 hours'
    },
    { 
      name: 'Node.js Backend Development', 
      progress: 89, 
      difficulty: 'Advanced',
      cards: 52,
      timeEstimate: '4 hours'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <SparklesIcon className="w-10 h-10 text-white animate-pulse" />
          </div>
          <LoadingSpinner size="xl" variant="primary" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Preparing your learning experience...</h3>
            <p className="text-gray-600">Loading personalized insights and recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-indigo-50'
    } ${className}`}>
      {/* Enhanced Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  LearnInSlices Pro
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-Powered Learning Platform
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpenIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
                { id: 'features', label: 'Features', icon: SparklesIcon },
                { id: 'settings', label: 'Settings', icon: CogIcon }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeView === item.id
                        ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700'
                        : darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              
              <button className="relative p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <BellIcon className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {greeting()}, {user?.username}!
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentTime.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.username}! 🚀
                  </h2>
                  <p className="text-primary-100 text-lg">
                    Ready to supercharge your learning journey? You're on a {quickStats[1].value} streak!
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <Button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  View Progress
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-center space-y-2">
                    <div className={`text-3xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm text-gray-600`}>
                      {stat.label}
                    </div>
                    <div className={`text-xs font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Learning Paths */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <BookOpenIcon className="w-6 h-6 text-primary-600" />
                  <span>Continue Learning</span>
                </h3>
                <div className="space-y-4">
                  {learningPaths.map((path, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{path.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{path.cards} cards</span>
                            <span>{path.timeEstimate}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              path.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                              path.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {path.difficulty}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary-600">{path.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                      <Button size="sm" className="w-full">
                        {path.progress > 80 ? 'Complete Path' : 'Continue'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  <span>Recent Activity</span>
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'achievement' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Performance Analytics</h2>
              <p className="text-gray-600 text-lg">Deep insights into your learning journey</p>
            </div>
            <PerformanceAnalytics />
          </div>
        )}

        {activeView === 'features' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Features</h2>
              <p className="text-gray-600 text-lg">Unlock the full potential of AI-powered learning</p>
            </div>
            <AdvancedFeatures />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Settings & Preferences</h2>
              <p className="text-gray-600 text-lg">Customize your learning experience</p>
            </div>
            <Card className="p-8 text-center">
              <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Panel</h3>
              <p className="text-gray-600">Advanced settings panel coming soon...</p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperchargedDashboard;
