import { useEffect, useState, Suspense } from 'react';
import { UnifiedHeader } from './components/layout';
import { LandingPageIntegration } from './components/landing';
import { NotificationProvider, LoadingSpinner } from './components/ui';
import { MicroCardDemo } from './pages';
import { DashboardDemo } from './pages/DashboardDemo';
import { EnhancedDashboardDemo } from './pages/EnhancedDashboardDemo';
import EnhancedMicroCardDemo from './pages/EnhancedMicroCardDemo';
import SuperchargedDashboard from './components/dashboard/SuperchargedDashboard';
import { useAuthStore } from './store';
import './App.css';

type DemoView = 'cards' | 'dashboard' | 'enhanced' | 'enhanced-cards' | 'landing';

function App() {
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);
  const [demoView, setDemoView] = useState<DemoView>('enhanced-cards');

  useEffect(() => {
    // Load user data if there's a stored token
    loadUser();
  }, [loadUser]);

  return (
    <NotificationProvider>
      <AppContent 
        user={user}
        isAuthenticated={isAuthenticated}
        showDemo={showDemo}
        setShowDemo={setShowDemo}
        demoView={demoView}
        setDemoView={setDemoView}
      />
    </NotificationProvider>
  );
}

interface AppContentProps {
  user: any;
  isAuthenticated: boolean;
  showDemo: boolean;
  setShowDemo: (show: boolean) => void;
  demoView: DemoView;
  setDemoView: (view: DemoView) => void;
}

function AppContent({ user, isAuthenticated, showDemo, setShowDemo, demoView, setDemoView }: AppContentProps) {
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" variant="primary" />
        <p className="text-gray-600 font-medium">Loading amazing learning content...</p>
      </div>
    </div>
  );

  // For development - show demo directly
  if (showDemo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader 
          currentView={demoView}
          onViewChange={(view) => setDemoView(view as DemoView)}
        />
        
        <main className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            {demoView === 'enhanced-cards' && <EnhancedMicroCardDemo />}
            {demoView === 'enhanced' && <EnhancedDashboardDemo />}
            {demoView === 'dashboard' && <DashboardDemo />}
            {demoView === 'cards' && <MicroCardDemo />}
            {demoView === 'landing' && (
              <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Experience Our Award-Winning Landing Page</h2>
                  <p className="text-xl text-gray-600">Check out our stunning animated landing page with advanced GSAP animations, interactive demos, and cutting-edge design!</p>
                  <div className="space-y-4">
                    <a 
                      href="http://localhost:8000" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-medium hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
                    >
                      <span>🚀 Open Landing Page</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <div className="flex flex-wrap gap-3 justify-center text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>GSAP 3D Animations</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>Interactive Demos</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span>Responsive Design</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </main>
      </div>
    );
  }

  // Show authenticated dashboard if user is logged in
  if (isAuthenticated && user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SuperchargedDashboard />
      </Suspense>
    );
  }

  // Show landing page with auth form
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPageIntegration onShowDemo={() => setShowDemo(true)} />
    </Suspense>
  );
}

function DashboardView({ user }: { user: any }) {
  const { logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for a live feel
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Dashboard Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LearnInSlices</h1>
                <span className="ml-2 px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-800 rounded-full border border-primary-200">
                  AI-Powered Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">{greeting()}, {user.username}!</p>
                <p className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.username}! 🎉</h2>
          <p className="text-primary-100 text-lg">Ready to continue your learning journey? Let's make today amazing!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Enhanced Quick Stats */}
          <div className="card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Your Progress</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total XP</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">1,247</span>
                  <span className="text-green-500 text-sm font-medium">+89 today</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Level</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-purple-600">12</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cards Mastered</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">156</span>
                  <span className="text-blue-500 text-sm font-medium">+12 this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Due Reviews */}
          <div className="card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Due for Review</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-orange-600 mb-3">23</div>
              <p className="text-gray-600 font-medium">Cards ready to review</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">76% completion rate this week</p>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className="card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Completed React Hooks</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Achieved Level 12</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Started TypeScript Path</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button className="group bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Start Daily Review</h3>
                <p className="text-primary-100 text-sm">23 cards waiting</p>
              </div>
            </div>
          </button>
          
          <button className="group bg-gradient-to-r from-secondary-500 to-secondary-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Browse Learning Paths</h3>
                <p className="text-secondary-100 text-sm">Discover new topics</p>
              </div>
            </div>
          </button>
          
          <button className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Create New Path</h3>
                <p className="text-green-100 text-sm">Build custom content</p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
