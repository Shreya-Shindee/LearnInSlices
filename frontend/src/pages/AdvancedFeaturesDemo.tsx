import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  BoltIcon, 
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { 
  LearningAnalyticsDashboard 
} from '../components/analytics';
import { 
  EnhancedMicroCardViewer, 
  StudyModeControls, 
  AdvancedFeatures 
} from '../components/learning';
import { 
  AIBackendDemo 
} from '../components/ai';
import { sampleCards } from '../data/sampleCards';

type DemoSection = 'overview' | 'analytics' | 'study-mode' | 'micro-cards' | 'features' | 'ai-backend';

const AdvancedFeaturesDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<DemoSection>('overview');
  const [studyModeActive, setStudyModeActive] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const demoSections = [
    {
      id: 'overview' as DemoSection,
      title: 'Platform Overview',
      description: 'Comprehensive learning platform features',
      icon: SparklesIcon,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'analytics' as DemoSection,
      title: 'Learning Analytics',
      description: 'Deep insights into learning patterns',
      icon: ChartBarIcon,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'study-mode' as DemoSection,
      title: 'Enhanced Study Mode',
      description: 'Advanced study controls and automation',
      icon: BoltIcon,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'micro-cards' as DemoSection,
      title: 'Interactive Cards',
      description: 'Rich content learning experience',
      icon: AcademicCapIcon,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'features' as DemoSection,
      title: 'Advanced Features',
      description: 'AI-powered learning enhancements',
      icon: SparklesIcon,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'ai-backend' as DemoSection,
      title: 'AI Backend Integration',
      description: 'Backend AI services and recommendations',
      icon: CpuChipIcon,
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const handleNext = () => {
    if (currentCardIndex < sampleCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handleModeChange = (mode: string) => {
    console.log('Study mode changed to:', mode);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to LearnInSlices Advanced Demo
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the future of AI-powered microlearning with advanced analytics, 
                smart study modes, and personalized learning paths.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoSections.slice(1).map(section => {
                const Icon = section.icon;
                return (
                  <div 
                    key={section.id}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {section.description}
                    </p>
                    <div className="flex items-center text-primary-600 text-sm font-medium">
                      <span>Explore</span>
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl border border-primary-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🚀 What's New in This Demo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">📊 Advanced Analytics</h4>
                  <p>Real-time learning insights, progress tracking, and personalized recommendations</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">⚡ Enhanced Study Modes</h4>
                  <p>Speed learning, focus mode, review sessions, and automated study controls</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">🎯 Smart Features</h4>
                  <p>AI-powered tutoring, interactive labs, and adaptive learning paths</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">📱 Enhanced UX</h4>
                  <p>Improved micro-card viewer with rich interactions and animations</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Learning Analytics Dashboard
              </h2>
              <p className="text-gray-600">
                Comprehensive insights into your learning journey and progress patterns
              </p>
            </div>
            <LearningAnalyticsDashboard />
          </div>
        );

      case 'study-mode':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enhanced Study Mode Controls
              </h2>
              <p className="text-gray-600">
                Advanced study features with automation, timing, and personalized modes
              </p>
            </div>
            
            <StudyModeControls
              isActive={studyModeActive}
              onToggle={() => setStudyModeActive(!studyModeActive)}
              totalCards={sampleCards.length}
              currentIndex={currentCardIndex}
              onNext={handleNext}
              onModeChange={handleModeChange}
            />

            {studyModeActive && (
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Study Mode Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-1">⚡ Speed Mode</h4>
                    <p className="text-yellow-700">
                      Rapid card progression with automatic advancement for quick reviews
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">🎯 Focus Mode</h4>
                    <p className="text-purple-700">
                      Minimalist interface removing distractions for deep concentration
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">🔄 Review Mode</h4>
                    <p className="text-blue-700">
                      Systematic review of previously studied material with spaced repetition
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">🧠 Drill Mode</h4>
                    <p className="text-green-700">
                      Intensive practice mode for mastery and retention improvement
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'micro-cards':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enhanced Micro-Card Viewer
              </h2>
              <p className="text-gray-600">
                Interactive learning cards with rich content and advanced features
              </p>
            </div>
            
            <EnhancedMicroCardViewer
              cards={sampleCards}
              pathId="demo-path"
              currentCardIndex={currentCardIndex}
              onCardChange={setCurrentCardIndex}
              enableAudio={true}
              enableNotes={true}
            />

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Card Viewer Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🎨 Rich Content</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Interactive code examples</li>
                    <li>• Image and media support</li>
                    <li>• Markdown rendering</li>
                    <li>• Quiz interactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">⚡ Smart Features</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Progress tracking</li>
                    <li>• Bookmarking system</li>
                    <li>• Note-taking capabilities</li>
                    <li>• Audio narration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📊 Analytics</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Time tracking</li>
                    <li>• Interaction logging</li>
                    <li>• Difficulty assessment</li>
                    <li>• Performance insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Advanced Learning Features
              </h2>
              <p className="text-gray-600">
                Cutting-edge AI and technology features to enhance your learning experience
              </p>
            </div>
            
            <AdvancedFeatures 
              onFeatureSelect={(feature) => console.log('Selected feature:', feature)}
            />

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Feature Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🤖 AI-Powered Learning</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Personalized learning paths based on your progress and preferences</p>
                    <p>• Intelligent content recommendations using advanced algorithms</p>
                    <p>• Adaptive difficulty adjustment based on performance patterns</p>
                    <p>• Smart hints and explanations tailored to your learning style</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🚀 Interactive Labs</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Hands-on coding environments with real-time feedback</p>
                    <p>• Interactive simulations for complex concepts</p>
                    <p>• Collaborative workspace for peer learning</p>
                    <p>• Project-based learning with portfolio integration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-backend':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI Backend Integration
              </h2>
              <p className="text-gray-600">
                Comprehensive AI services including content generation, analytics, and recommendations
              </p>
            </div>
            
            <AIBackendDemo />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  LearnInSlices Advanced Demo
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Demo Version</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {demoSections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeSection === section.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              This demo showcases the advanced features of the LearnInSlices platform.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ready for production with comprehensive analytics, enhanced study modes, and AI-powered features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo;
