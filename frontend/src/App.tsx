import { useEffect, useState } from 'react';
import { AuthForm } from './components/auth';
import { MicroCardDemo } from './pages';
import { useAuthStore } from './store';
import './App.css';

function App() {
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Load user data if there's a stored token
    loadUser();
  }, [loadUser]);

  // For development - show demo directly
  if (showDemo) {
    return <MicroCardDemo />;
  }

  // Show authenticated dashboard if user is logged in
  if (isAuthenticated && user) {
    return <DashboardView user={user} />;
  }

  // Show landing page with auth form
  return <LandingPage onShowDemo={() => setShowDemo(true)} />;
}

function LandingPage({ onShowDemo }: { onShowDemo: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">LearnInSlices</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                AI-Powered
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors">
                Pricing
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Anything in
            <span className="text-primary-600"> Bite-Sized Pieces</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform any topic into personalized micro-learning cards with AI. 
            Adaptive spaced repetition, gamification, and peer collaboration make learning stick.
          </p>
          
          {/* Auth Form */}
          <AuthForm />
          
          {/* Demo Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onShowDemo}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors border border-primary-200 hover:border-primary-300 px-6 py-3 rounded-lg"
            >
              Try Interactive Demo →
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Generated Cards</h3>
            <p className="text-gray-600">
              Our AI breaks down complex topics into digestible micro-learning cards tailored to your pace.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Spaced Repetition</h3>
            <p className="text-gray-600">
              Intelligent scheduling ensures you review content at optimal intervals for long-term retention.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Social Learning</h3>
            <p className="text-gray-600">
              Join study groups, compete in challenges, and learn collaboratively with peers worldwide.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardView({ user }: { user: any }) {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">LearnInSlices</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}!</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total XP</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Level</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cards Mastered</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>

          {/* Due Reviews */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Due for Review</h3>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
              <p className="text-gray-600">Cards ready to review</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="text-center py-4 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start learning to see your progress here!</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button className="btn-primary">
            Start Daily Review
          </button>
          <button className="btn-secondary">
            Browse Learning Paths
          </button>
          <button className="btn-secondary">
            Create New Path
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
