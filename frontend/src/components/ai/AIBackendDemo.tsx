import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ChartBarIcon,
  CpuChipIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  BeakerIcon,
  BoltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { apiService } from '../../services/api';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  status: 'available' | 'demo' | 'coming_soon';
  demo: () => Promise<any>;
}

const AIBackendDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [demoResults, setDemoResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const aiFeatures: AIFeature[] = [
    {
      id: 'content-generation',
      name: 'AI Content Generation',
      description: 'Generate personalized learning cards using advanced language models',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-600',
      status: 'available',
      demo: async () => {
        return await apiService.generateAIContent({
          topic: 'React Hooks',
          difficulty: 'intermediate',
          learning_style: 'interactive',
          context: 'Web development course for intermediate developers'
        });
      }
    },
    {
      id: 'personalized-paths',
      name: 'Personalized Learning Paths',
      description: 'AI-generated learning paths tailored to your goals and skill level',
      icon: RocketLaunchIcon,
      color: 'from-blue-500 to-cyan-600',
      status: 'available',
      demo: async () => {
        return await apiService.createPersonalizedPath({
          topic: 'Machine Learning Fundamentals',
          skill_level: 'beginner',
          goals: ['Understand ML concepts', 'Build first ML model'],
          time_commitment: 30
        });
      }
    },
    {
      id: 'smart-recommendations',
      name: 'Smart Recommendations',
      description: 'AI-powered content recommendations based on learning patterns',
      icon: LightBulbIcon,
      color: 'from-green-500 to-emerald-600',
      status: 'available',
      demo: async () => {
        return await apiService.getPersonalizedRecommendations(5);
      }
    },
    {
      id: 'study-optimization',
      name: 'Study Schedule Optimization',
      description: 'AI-optimized spaced repetition and study scheduling',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-red-600',
      status: 'available',
      demo: async () => {
        return await apiService.optimizeStudySchedule();
      }
    },
    {
      id: 'analytics-insights',
      name: 'Advanced Analytics',
      description: 'Deep learning insights and performance predictions',
      icon: CpuChipIcon,
      color: 'from-indigo-500 to-purple-600',
      status: 'available',
      demo: async () => {
        return await apiService.getDetailedAnalytics(30);
      }
    },
    {
      id: 'adaptive-sessions',
      name: 'Adaptive Study Sessions',
      description: 'AI-created study sessions that adapt to your performance',
      icon: BoltIcon,
      color: 'from-yellow-500 to-orange-600',
      status: 'available',
      demo: async () => {
        return await apiService.createStudySession({
          duration_minutes: 25,
          focus_areas: ['algorithms', 'data-structures'],
          session_type: 'mixed'
        });
      }
    },
    {
      id: 'collaborative-ai',
      name: 'Collaborative Learning',
      description: 'AI-powered study group recommendations and peer matching',
      icon: BeakerIcon,
      color: 'from-teal-500 to-blue-600',
      status: 'demo',
      demo: async () => {
        return {
          recommended_groups: [
            { name: 'React Enthusiasts', members: 156, compatibility: 0.92 },
            { name: 'ML Study Circle', members: 89, compatibility: 0.87 }
          ],
          ai_insights: 'Based on your learning pattern, these groups match your study style'
        };
      }
    },
    {
      id: 'predictive-performance',
      name: 'Predictive Performance',
      description: 'AI predictions for learning outcomes and goal achievement',
      icon: TrophyIcon,
      color: 'from-rose-500 to-pink-600',
      status: 'demo',
      demo: async () => {
        return {
          next_week_prediction: {
            expected_accuracy: 0.87,
            cards_to_master: 15,
            confidence: 0.92
          },
          recommendations: [
            'Focus on reviewing difficult cards in the morning',
            'Increase daily study time by 5 minutes for optimal results'
          ]
        };
      }
    }
  ];

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await apiService.healthCheck();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const runDemo = async (feature: AIFeature) => {
    setActiveDemo(feature.id);
    setLoading(true);
    setDemoResults(null);

    try {
      const result = await feature.demo();
      setDemoResults(result);
    } catch (error) {
      setDemoResults({
        error: true,
        message: 'Demo failed - this is expected when backend is not running',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Available
          </span>
        );
      case 'demo':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Demo Mode
          </span>
        );
      case 'coming_soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        );
      default:
        return null;
    }
  };

  const renderDemoResult = () => {
    if (!demoResults) return null;

    if (demoResults.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Demo Error</h4>
          <p className="text-red-700 text-sm mb-2">{demoResults.message}</p>
          {demoResults.details && (
            <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
              {demoResults.details}
            </pre>
          )}
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Demo Result</h4>
        <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-x-auto max-h-96">
          {JSON.stringify(demoResults, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI Backend Integration Demo
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Experience the power of AI-driven learning with our advanced backend integration. 
          These features showcase real AI capabilities for personalized education.
        </p>
        
        {/* Backend Status */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border">
          <div className={`w-3 h-3 rounded-full ${
            backendStatus === 'connected' ? 'bg-green-500' : 
            backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          } ${backendStatus === 'checking' ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium">
            Backend Status: {
              backendStatus === 'connected' ? 'Connected' : 
              backendStatus === 'error' ? 'Offline (Demo Mode)' : 'Checking...'
            }
          </span>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeDemo === feature.id;
          
          return (
            <div 
              key={feature.id}
              className={`relative bg-white rounded-xl border-2 transition-all duration-300 ${
                isActive ? 'border-primary-500 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {feature.description}
                </p>
                
                <Button
                  onClick={() => runDemo(feature)}
                  disabled={loading && isActive}
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {loading && isActive ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Running...
                    </>
                  ) : (
                    'Try Demo'
                  )}
                </Button>
              </div>
              
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Demo Results */}
      {activeDemo && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Demo Result: {aiFeatures.find(f => f.id === activeDemo)?.name}
            </h3>
            <Button
              onClick={() => {
                setActiveDemo(null);
                setDemoResults(null);
              }}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Running AI demo...</span>
            </div>
          ) : (
            renderDemoResult()
          )}
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔧 Technical Implementation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Backend Technologies</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• FastAPI with async/await for high performance</li>
              <li>• AI/ML integration with Transformers & Sentence-BERT</li>
              <li>• PostgreSQL with SQLAlchemy ORM</li>
              <li>• JWT authentication with secure token management</li>
              <li>• Redis for caching and session management</li>
              <li>• Docker containerization for easy deployment</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI Features</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Content generation using GPT-based models</li>
              <li>• Semantic embeddings for content similarity</li>
              <li>• Collaborative filtering for recommendations</li>
              <li>• Spaced repetition optimization algorithms</li>
              <li>• Learning analytics with pattern recognition</li>
              <li>• Adaptive difficulty adjustment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          🚀 Ready for Production
        </h3>
        <p className="text-primary-700 mb-4">
          The LearnInSlices platform now includes a complete AI-powered backend with advanced 
          learning features. Here's what's ready for deployment:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-1">✅ Authentication</h4>
            <p className="text-primary-700">Secure JWT-based auth system</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-1">✅ AI Integration</h4>
            <p className="text-primary-700">Full AI service with ML models</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-1">✅ Analytics</h4>
            <p className="text-primary-700">Comprehensive learning analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBackendDemo;
