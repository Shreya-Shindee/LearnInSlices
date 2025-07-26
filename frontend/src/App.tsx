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

export default App;
